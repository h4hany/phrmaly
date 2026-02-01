import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators, FormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {WizardComponent, WizardStep} from '../../../../shared/components/wizard/wizard.component';
import {TextInputComponent} from '../../../../shared/components/input/text-input.component';
import {AutocompleteInputComponent, AutocompleteOption} from '../../../../shared/components/input/autocomplete-input.component';
import {ButtonComponent} from '../../../../shared/components/button/button.component';
import {SelectableCardComponent} from '../../../../shared/components/selectable-card/selectable-card.component';
import {TranslatePipe} from '../../../../core/pipes/translate.pipe';
import {FileUploadComponent} from '../../../../shared/components/file-input/file-upload.component';
import {PlatformSubscriptionsService} from '../../../../core/services/platform-subscriptions.service';
import {PlatformAccountsService} from '../../../../core/services/platform-accounts.service';
import {PlatformCountriesService, Country} from '../../../../core/services/platform-countries.service';
import {PlatformCitiesService, City} from '../../../../core/services/platform-cities.service';
import {PlatformAreasService, Area} from '../../../../core/services/platform-areas.service';
import {PlatformModulesService, PlatformModule} from '../../../../core/services/platform-modules.service';
import {TranslationService} from '../../../../core/services/translation.service';
import {SubscriptionPlan} from '../../../../core/models/platform.model';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {Subject, Observable} from 'rxjs';

interface PharmacyFormData {
  name: string;
  address: string;
  city: string;
  area: string;
  country: string;
  lat: number;
  long: number;
  manager: {
    fullName: string;
    email: string;
    password: string;
  };
}

interface Module {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  capabilities: string[];
  capabilitiesAr: string[];
  pricePerMonth: number;
}

@Component({
  selector: 'app-create-account',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    WizardComponent,
    TextInputComponent,
    AutocompleteInputComponent,
    ButtonComponent,
    TranslatePipe,
    SelectableCardComponent,
    FileUploadComponent
  ],
  templateUrl: './create-account.component.html',
  styles: []
})
export class CreateAccountComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private subscriptionsService = inject(PlatformSubscriptionsService);
  private accountsService = inject(PlatformAccountsService);
  private countriesService = inject(PlatformCountriesService);
  private citiesService = inject(PlatformCitiesService);
  private areasService = inject(PlatformAreasService);
  private modulesService = inject(PlatformModulesService);
  private translationService = inject(TranslationService);

  currentStep = 1;
  selectedPlan: SubscriptionPlan | null = null;
  selectedModules: Module[] = [];
  plans: SubscriptionPlan[] = [];
  modules: Module[] = [];
  loading = false;
  errorMessage = '';
  contractFile: File | null = null;
  logoFile: File | null = null;
  paidAmount: number = 0;

  accountForm!: FormGroup;
  pharmaciesForm!: FormGroup;

  // Store options for each pharmacy index
  countryOptions: Map<number, AutocompleteOption[]> = new Map();
  cityOptions: Map<number, AutocompleteOption[]> = new Map();
  areaOptions: Map<number, AutocompleteOption[]> = new Map();

  // Search subjects for debouncing
  private countrySearchSubjects: Map<number, Subject<string>> = new Map();
  private citySearchSubjects: Map<number, Subject<string>> = new Map();
  private areaSearchSubjects: Map<number, Subject<string>> = new Map();

  wizardSteps: WizardStep[] = [
    {
      number: 1,
      title: 'account.create.wizard.step1',
      subtitle: 'account.create.wizard.step1Subtitle',
      completed: false
    },
    {
      number: 2,
      title: 'account.create.wizard.step2Modules',
      subtitle: 'account.create.wizard.step2ModulesSubtitle',
      completed: false
    },
    {
      number: 3,
      title: 'account.create.wizard.step3',
      subtitle: 'account.create.wizard.step3Subtitle',
      completed: false
    },
    {
      number: 4,
      title: 'account.create.wizard.step4',
      subtitle: 'account.create.wizard.step4Subtitle',
      completed: false
    },
    {
      number: 5,
      title: 'account.create.wizard.step5',
      subtitle: 'account.create.wizard.step5Subtitle',
      completed: false
    }
  ];

  ngOnInit(): void {
    this.initializeForms();
    this.loadPlans();
    this.loadModules();
  }

  initializeForms(): void {
    this.accountForm = this.fb.group({
      name: ['PharmaCorp Inc.', [Validators.required]],
      email: ['admin@pharmacorp.com', [Validators.required, Validators.email]],
      username: ['pharmacorp_admin', [Validators.required]],
      password: ['SecurePass123!', [Validators.required, Validators.minLength(8)]],
      phone: ['+201234567890', [Validators.required]],
      website: ['https://pharmacorp.com', []]
    });

    this.pharmaciesForm = this.fb.group({
      pharmacies: this.fb.array([])
    });

    // Add initial pharmacy with mock data
    this.addPharmacy();
  }

  loadPlans(): void {
    this.subscriptionsService.getPlans({page: 1, pageSize: 100, isActive: true}).subscribe({
      next: (response) => {
        this.plans = response.data;
      },
      error: (error) => {
        console.error('Error loading plans:', error);
      }
    });
  }

  loadModules(): void {
    this.modulesService.getAll({ page: 1, pageSize: 100 }).subscribe({
      next: (response) => {
        // Filter only active modules and map them
        this.modules = response.data
          .filter(module => module.isActive)
          .map(module => this.mapPlatformModuleToModule(module));
      },
      error: (error) => {
        console.error('Error loading modules:', error);
        this.modules = [];
      }
    });
  }

  private mapPlatformModuleToModule(platformModule: PlatformModule): Module {
    // Parse capabilities from comma-separated string to array
    const capabilities = platformModule.capabilities
      ? platformModule.capabilities.split(',').map(c => c.trim()).filter(c => c.length > 0)
      : [];
    
    // Parse Arabic capabilities from comma-separated string to array
    const capabilitiesAr = platformModule.capabilitiesAr
      ? platformModule.capabilitiesAr.split(',').map(c => c.trim()).filter(c => c.length > 0)
      : [];

    return {
      id: platformModule.id,
      name: platformModule.name,
      nameAr: platformModule.nameAr || platformModule.name,
      description: platformModule.description,
      descriptionAr: platformModule.descriptionAr || platformModule.description,
      capabilities: capabilities,
      capabilitiesAr: capabilitiesAr,
      pricePerMonth: platformModule.price
    };
  }

  toggleModule(module: Module): void {
    const index = this.selectedModules.findIndex(m => m.id === module.id);
    if (index >= 0) {
      this.selectedModules.splice(index, 1);
    } else {
      this.selectedModules.push(module);
    }
  }

  isModuleSelected(module: Module): boolean {
    return this.selectedModules.some(m => m.id === module.id);
  }

  getTotalMonthlyPrice(): number {
    let planPrice = 0;
    if (this.selectedPlan) {
      // Convert annual price to monthly if needed
      if (this.selectedPlan.billingCycle === 'annual') {
        planPrice = this.selectedPlan.price / 12;
      } else {
        planPrice = this.selectedPlan.price;
      }
    }
    const modulesPrice = this.selectedModules.reduce((sum, module) => sum + module.pricePerMonth, 0);
    return planPrice + modulesPrice;
  }

  getRemainingAmount(): number {
    const total = this.getTotalMonthlyPrice();
    return Math.max(0, total - this.paidAmount);
  }

  getCurrentLanguage(): 'en' | 'ar' {
    return this.translationService.getCurrentLanguage();
  }

  selectPlan(plan: SubscriptionPlan): void {
    this.selectedPlan = plan;
  }

  get pharmaciesArray(): FormArray {
    return this.pharmaciesForm.get('pharmacies') as FormArray;
  }

  addPharmacy(): void {
    const index = this.pharmaciesArray.length;
    const pharmacyGroup = this.fb.group({
      name: ['Main Pharmacy', [Validators.required]],
      address: ['123 Main Street', [Validators.required]],
      countryId: [null, [Validators.required]],
      cityId: [null, [Validators.required]],
      areaId: [null, [Validators.required]],
      lat: [30.0444, [Validators.required]],
      long: [31.2357, [Validators.required]],
      manager: this.fb.group({
        fullName: ['Ahmed Mohamed', [Validators.required]],
        email: ['ahmed@pharmacy.com', [Validators.required, Validators.email]],
        password: ['ManagerPass123!', [Validators.required, Validators.minLength(8)]]
      })
    });

    this.pharmaciesArray.push(pharmacyGroup);

    // Initialize options and search subjects for this pharmacy
    this.countryOptions.set(index, []);
    this.cityOptions.set(index, []);
    this.areaOptions.set(index, []);

    // Initialize search subjects
    this.initializeSearchSubjects(index);

    // Load initial countries
    this.loadCountries(index);
  }

  removePharmacy(index: number): void {
    this.pharmaciesArray.removeAt(index);

    // Clean up options and search subjects
    this.countryOptions.delete(index);
    this.cityOptions.delete(index);
    this.areaOptions.delete(index);
    this.countrySearchSubjects.delete(index);
    this.citySearchSubjects.delete(index);
    this.areaSearchSubjects.delete(index);

    // Reindex remaining pharmacies
    this.reindexPharmacies();
  }

  private reindexPharmacies(): void {
    // Rebuild maps with new indices
    const newCountryOptions = new Map<number, AutocompleteOption[]>();
    const newCityOptions = new Map<number, AutocompleteOption[]>();
    const newAreaOptions = new Map<number, AutocompleteOption[]>();
    const newCountrySearchSubjects = new Map<number, Subject<string>>();
    const newCitySearchSubjects = new Map<number, Subject<string>>();
    const newAreaSearchSubjects = new Map<number, Subject<string>>();

    this.pharmaciesArray.controls.forEach((_, newIndex) => {
      const oldIndex = newIndex;
      if (this.countryOptions.has(oldIndex)) {
        newCountryOptions.set(newIndex, this.countryOptions.get(oldIndex)!);
      }
      if (this.cityOptions.has(oldIndex)) {
        newCityOptions.set(newIndex, this.cityOptions.get(oldIndex)!);
      }
      if (this.areaOptions.has(oldIndex)) {
        newAreaOptions.set(newIndex, this.areaOptions.get(oldIndex)!);
      }
      if (this.countrySearchSubjects.has(oldIndex)) {
        newCountrySearchSubjects.set(newIndex, this.countrySearchSubjects.get(oldIndex)!);
      }
      if (this.citySearchSubjects.has(oldIndex)) {
        newCitySearchSubjects.set(newIndex, this.citySearchSubjects.get(oldIndex)!);
      }
      if (this.areaSearchSubjects.has(oldIndex)) {
        newAreaSearchSubjects.set(newIndex, this.areaSearchSubjects.get(oldIndex)!);
      }
    });

    this.countryOptions = newCountryOptions;
    this.cityOptions = newCityOptions;
    this.areaOptions = newAreaOptions;
    this.countrySearchSubjects = newCountrySearchSubjects;
    this.citySearchSubjects = newCitySearchSubjects;
    this.areaSearchSubjects = newAreaSearchSubjects;
  }

  getPharmacyControl(index: number, field: string): FormControl {
    return this.pharmaciesArray.at(index).get(field) as FormControl;
  }

  getManagerControl(index: number, field: string): FormControl {
    return this.pharmaciesArray.at(index).get('manager')?.get(field) as FormControl;
  }

  getPharmacyValue(index: number, field: string): string {
    return this.pharmaciesArray.at(index).get(field)?.value || '';
  }

  getManagerValue(index: number, field: string): string {
    return this.pharmaciesArray.at(index).get('manager')?.get(field)?.value || '';
  }

  getCountryName(index: number): string {
    const countryId = this.getPharmacyValue(index, 'countryId');
    if (!countryId) return '';
    const options = this.countryOptions.get(index) || [];
    const option = options.find(opt => opt.value === countryId);
    return option?.label || '';
  }

  getCityName(index: number): string {
    const cityId = this.getPharmacyValue(index, 'cityId');
    if (!cityId) return '';
    const options = this.cityOptions.get(index) || [];
    const option = options.find(opt => opt.value === cityId);
    return option?.label || '';
  }

  getAreaName(index: number): string {
    const areaId = this.getPharmacyValue(index, 'areaId');
    if (!areaId) return '';
    const options = this.areaOptions.get(index) || [];
    const option = options.find(opt => opt.value === areaId);
    return option?.label || '';
  }

  onStepChange(step: number): void {
    if (this.canNavigateToStep(step)) {
      this.currentStep = step;
      this.updateWizardSteps();
    }
  }

  canNavigateToStep(step: number): boolean {
    if (step === 1) return true;
    if (step === 2) return !!this.selectedPlan;
    if (step === 3) return !!this.selectedPlan; // Modules step is optional
    if (step === 4) return this.accountForm.valid;
    if (step === 5) return this.pharmaciesForm.valid && this.pharmaciesArray.length > 0;
    return false;
  }

  updateWizardSteps(): void {
    this.wizardSteps.forEach(step => {
      if (step.number < this.currentStep) {
        step.completed = true;
      }
    });
  }

  nextStep(): void {
    // Validate current step before proceeding
    if (this.currentStep === 1 && !this.selectedPlan) {
      this.errorMessage = 'account.create.validationError';
      return;
    }
    // Step 2 (modules) is optional, no validation needed
    if (this.currentStep === 3 && this.accountForm.invalid) {
      this.accountForm.markAllAsTouched();
      this.errorMessage = 'account.create.validationError';
      return;
    }
    if (this.currentStep === 4 && (this.pharmaciesForm.invalid || this.pharmaciesArray.length === 0)) {
      this.pharmaciesForm.markAllAsTouched();
      this.errorMessage = 'account.create.validationError';
      return;
    }

    this.errorMessage = '';
    if (this.currentStep < this.wizardSteps.length) {
      // Mark current step as completed
      const currentStepObj = this.wizardSteps.find(s => s.number === this.currentStep);
      if (currentStepObj) {
        currentStepObj.completed = true;
      }
      this.currentStep++;
      this.updateWizardSteps();
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.errorMessage = '';
      this.currentStep--;
    }
  }

  createAccount(): void {
    if (!this.selectedPlan || this.accountForm.invalid || this.pharmaciesForm.invalid) {
      this.errorMessage = 'account.create.validationError';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    // Build request matching backend ProvisionAccountRequestDto
    const pharmaciesData = this.pharmaciesArray.value.map((pharmacy: any) => {
      const pharmacyData: any = {
        name: pharmacy.name,
        address: pharmacy.address || undefined,
        areaId: pharmacy.areaId ? String(pharmacy.areaId) : undefined, // Ensure it's a string (Guid)
        latitude: pharmacy.lat ? parseFloat(pharmacy.lat) : undefined,
        longitude: pharmacy.long ? parseFloat(pharmacy.long) : undefined
      };
      
      // Include manager if it exists and has required fields
      if (pharmacy.manager && pharmacy.manager.fullName && pharmacy.manager.email && pharmacy.manager.password) {
        pharmacyData.manager = {
          fullName: pharmacy.manager.fullName,
          email: pharmacy.manager.email,
          password: pharmacy.manager.password
        };
      }
      
      return pharmacyData;
    });

    const request = {
      planId: this.selectedPlan.id,
      selectedModules: this.selectedModules.map(m => m.id),
      accountInfo: {
        name: this.accountForm.get('name')?.value,
        email: this.accountForm.get('email')?.value,
        phone: this.accountForm.get('phone')?.value || undefined,
        website: this.accountForm.get('website')?.value || undefined,
        logoUrl: undefined, // Logo URL would be set after upload to storage service
        contract: this.contractFile || undefined
      },
      pharmacies: pharmaciesData,
      paidAmount: this.paidAmount > 0 ? this.paidAmount : undefined,
      accountOwner: {
        fullName: this.accountForm.get('name')?.value || 'Account Owner', // Use account name as owner name
        email: this.accountForm.get('email')?.value,
        username: this.accountForm.get('username')?.value,
        password: this.accountForm.get('password')?.value
      }
    };

    // Call the API
    this.accountsService.provisionAccount(request).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Show success message with credentials
          console.log('Account provisioned:', response.data);
          this.loading = false;
          this.router.navigate(['/super-admin/accounts']);
        } else {
          this.errorMessage = response.message || 'account.create.validationError';
          this.loading = false;
        }
      },
      error: (error) => {
        this.errorMessage = error.message || error.errors?.[0]?.message || 'account.create.validationError';
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/super-admin/accounts']);
  }

  onContractFileChange(file: File): void {
    this.contractFile = file;
  }

  onLogoFileChange(file: File): void {
    this.logoFile = file;
  }

  // Initialize search subjects for debouncing
  private initializeSearchSubjects(index: number): void {
    const countrySubject = new Subject<string>();
    const citySubject = new Subject<string>();
    const areaSubject = new Subject<string>();

    countrySubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(searchTerm => this.searchCountries(index, searchTerm))
    ).subscribe();

    citySubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(searchTerm => this.searchCities(index, searchTerm))
    ).subscribe();

    areaSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(searchTerm => this.searchAreas(index, searchTerm))
    ).subscribe();

    this.countrySearchSubjects.set(index, countrySubject);
    this.citySearchSubjects.set(index, citySubject);
    this.areaSearchSubjects.set(index, areaSubject);
  }

  // Load countries
  private loadCountries(index: number): void {
    this.countriesService.getAll({ page: 1, pageSize: 100, isActive: true }).subscribe({
      next: (response) => {
        const options: AutocompleteOption[] = response.data.map(country => ({
          value: country.id,
          label: country.name,
          metadata: country
        }));
        this.countryOptions.set(index, options);
      },
      error: (error) => {
        console.error('Error loading countries:', error);
        this.countryOptions.set(index, []);
      }
    });
  }

  // Search countries
  private searchCountries(index: number, searchTerm: string): Observable<void> {
    return new Observable(observer => {
      this.countriesService.getAll({
        page: 1,
        pageSize: 100,
        isActive: true,
        searchTerm: searchTerm || undefined
      }).subscribe({
        next: (response) => {
          const options: AutocompleteOption[] = response.data.map(country => ({
            value: country.id,
            label: country.name,
            metadata: country
          }));
          this.countryOptions.set(index, options);
          observer.next();
          observer.complete();
        },
        error: (error) => {
          console.error('Error searching countries:', error);
          observer.complete();
        }
      });
    });
  }

  // Load cities for a country
  private loadCities(index: number, countryId: string): void {
    if (!countryId) {
      this.cityOptions.set(index, []);
      return;
    }

    this.citiesService.getAll({
      page: 1,
      pageSize: 100,
      isActive: true,
      countryId: countryId
    }).subscribe({
      next: (response) => {
        const options: AutocompleteOption[] = response.data.map(city => ({
          value: city.id,
          label: city.name,
          metadata: city
        }));
        this.cityOptions.set(index, options);
      },
      error: (error) => {
        console.error('Error loading cities:', error);
        this.cityOptions.set(index, []);
      }
    });
  }

  // Search cities
  private searchCities(index: number, searchTerm: string): Observable<void> {
    return new Observable(observer => {
      const countryId = this.getPharmacyControl(index, 'countryId')?.value;
      if (!countryId) {
        observer.complete();
        return;
      }

      this.citiesService.getAll({
        page: 1,
        pageSize: 100,
        isActive: true,
        countryId: countryId,
        searchTerm: searchTerm || undefined
      }).subscribe({
        next: (response) => {
          const options: AutocompleteOption[] = response.data.map(city => ({
            value: city.id,
            label: city.name,
            metadata: city
          }));
          this.cityOptions.set(index, options);
          observer.next();
          observer.complete();
        },
        error: (error) => {
          console.error('Error searching cities:', error);
          observer.complete();
        }
      });
    });
  }

  // Load areas for a city
  private loadAreas(index: number, cityId: string): void {
    if (!cityId) {
      this.areaOptions.set(index, []);
      return;
    }

    this.areasService.getAll({
      page: 1,
      pageSize: 100,
      isActive: true,
      cityId: cityId
    }).subscribe({
      next: (response) => {
        const options: AutocompleteOption[] = response.data.map(area => ({
          value: area.id,
          label: area.name,
          metadata: area
        }));
        this.areaOptions.set(index, options);
      },
      error: (error) => {
        console.error('Error loading areas:', error);
        this.areaOptions.set(index, []);
      }
    });
  }

  // Search areas
  private searchAreas(index: number, searchTerm: string): Observable<void> {
    return new Observable(observer => {
      const cityId = this.getPharmacyControl(index, 'cityId')?.value;
      if (!cityId) {
        observer.complete();
        return;
      }

      this.areasService.getAll({
        page: 1,
        pageSize: 100,
        isActive: true,
        cityId: cityId,
        searchTerm: searchTerm || undefined
      }).subscribe({
        next: (response) => {
          const options: AutocompleteOption[] = response.data.map(area => ({
            value: area.id,
            label: area.name,
            metadata: area
          }));
          this.areaOptions.set(index, options);
          observer.next();
          observer.complete();
        },
        error: (error) => {
          console.error('Error searching areas:', error);
          observer.complete();
        }
      });
    });
  }

  // Get options for template
  getCountryOptions(index: number): AutocompleteOption[] {
    return this.countryOptions.get(index) || [];
  }

  getCityOptions(index: number): AutocompleteOption[] {
    return this.cityOptions.get(index) || [];
  }

  getAreaOptions(index: number): AutocompleteOption[] {
    return this.areaOptions.get(index) || [];
  }

  // Handle selections
  onCountrySelected(index: number, option: AutocompleteOption): void {
    // Clear city and area when country changes
    this.getPharmacyControl(index, 'cityId')?.setValue(null);
    this.getPharmacyControl(index, 'areaId')?.setValue(null);
    this.cityOptions.set(index, []);
    this.areaOptions.set(index, []);

    // Load cities for selected country
    if (option.value) {
      this.loadCities(index, option.value as string);
    }
  }

  onCitySelected(index: number, option: AutocompleteOption): void {
    // Clear area when city changes
    this.getPharmacyControl(index, 'areaId')?.setValue(null);
    this.areaOptions.set(index, []);

    // Load areas for selected city
    if (option.value) {
      this.loadAreas(index, option.value as string);
    }
  }

  onAreaSelected(index: number, option: AutocompleteOption): void {
    // Area selected, no further cascading needed
  }

  // Handle search input changes
  onCountrySearch(index: number, searchTerm: string): void {
    const subject = this.countrySearchSubjects.get(index);
    if (subject) {
      subject.next(searchTerm);
    } else {
      // If no subject exists, load directly
      this.searchCountries(index, searchTerm).subscribe();
    }
  }

  onCitySearch(index: number, searchTerm: string): void {
    const subject = this.citySearchSubjects.get(index);
    if (subject) {
      subject.next(searchTerm);
    } else {
      // If no subject exists, load directly
      this.searchCities(index, searchTerm).subscribe();
    }
  }

  onAreaSearch(index: number, searchTerm: string): void {
    const subject = this.areaSearchSubjects.get(index);
    if (subject) {
      subject.next(searchTerm);
    } else {
      // If no subject exists, load directly
      this.searchAreas(index, searchTerm).subscribe();
    }
  }
}
