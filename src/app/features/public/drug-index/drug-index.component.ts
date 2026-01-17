import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, inject, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PublicDrugService, PublicDrug } from '../../../core/services/public-drug.service';
import { TranslationService } from '../../../core/services/translation.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-drug-index',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  templateUrl: './drug-index.component.html',
  styleUrls: ['./drug-index.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class DrugIndexComponent implements OnInit, AfterViewInit, OnDestroy {
  private drugService = inject(PublicDrugService);
  private router = inject(Router);
  private translationService = inject(TranslationService);
  @ViewChild('particleCanvas', { static: false }) particleCanvas!: ElementRef<HTMLCanvasElement>;
  
  drugs: PublicDrug[] = [];
  filteredDrugs: PublicDrug[] = [];
  selectedDrug: PublicDrug | null = null;
  loading = false;
  searchTerm = '';
  typeFilter = 'all';
  manufacturerFilter = 'all';
  sortFilter = 'name-asc';
  manufacturers: string[] = [];
  viewMode: 'grid' | 'list' = 'grid';
  currentLanguage: 'en' | 'ar' = 'en';
  
  private animationFrameId?: number;
  private pills: any[] = [];

  ngOnInit(): void {
    this.loadGoogleFonts();
    this.loadDrugs();
    this.loadManufacturers();
    // Initialize language
    this.currentLanguage = this.translationService.getCurrentLanguage();
    this.translationService.currentLang$.subscribe(lang => {
      this.currentLanguage = lang;
      // Apply RTL/LTR
      document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
      document.documentElement.setAttribute('lang', lang);
    });
  }

  ngAfterViewInit(): void {
    this.initParticleSystem();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private loadGoogleFonts(): void {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700;800&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }

  private initParticleSystem(): void {
    if (!this.particleCanvas?.nativeElement) return;
    
    const canvas = this.particleCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    class Pill {
      x: number;
      y: number;
      width: number;
      height: number;
      speedX: number;
      speedY: number;
      rotation: number;
      rotationSpeed: number;
      opacity: number;
      color: string;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.width = Math.random() * 30 + 20;
        this.height = this.width * 0.4;
        this.speedX = Math.random() * 0.3 - 0.15;
        this.speedY = Math.random() * 0.3 - 0.15;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.01;
        this.opacity = Math.random() * 0.3 + 0.1;
        this.color = Math.random() > 0.5 ? 'rgba(0, 212, 170,' : 'rgba(0, 255, 204,';
      }

      update(): void {
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;

        if (this.x > canvas.width + this.width) this.x = -this.width;
        if (this.x < -this.width) this.x = canvas.width + this.width;
        if (this.y > canvas.height + this.height) this.y = -this.height;
        if (this.y < -this.height) this.y = canvas.height + this.height;
      }

      draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        ctx.fillStyle = this.color + this.opacity + ')';
        
        // Left semicircle
        ctx.beginPath();
        ctx.arc(-this.width/4, 0, this.height/2, Math.PI/2, Math.PI*3/2);
        ctx.fill();
        
        // Right semicircle
        ctx.beginPath();
        ctx.arc(this.width/4, 0, this.height/2, -Math.PI/2, Math.PI/2);
        ctx.fill();
        
        // Rectangle in the middle
        ctx.fillRect(-this.width/4, -this.height/2, this.width/2, this.height);
        
        ctx.restore();
      }
    }

    this.pills = [];
    for (let i = 0; i < 40; i++) {
      this.pills.push(new Pill());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      this.pills.forEach(pill => {
        pill.update();
        pill.draw(ctx);
      });

      this.animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
  }

  loadDrugs(): void {
    this.loading = true;
    this.drugService.getAll({
      search: this.searchTerm,
      type: this.typeFilter,
      manufacturer: this.manufacturerFilter,
      sortBy: this.sortFilter
    }).subscribe({
      next: (drugs) => {
        this.drugs = drugs;
        this.filteredDrugs = drugs;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  loadManufacturers(): void {
    this.drugService.getManufacturers().subscribe({
      next: (manufacturers) => {
        this.manufacturers = manufacturers;
      }
    });
  }

  onSearchChange(): void {
    this.loadDrugs();
  }

  onFilterChange(): void {
    this.loadDrugs();
  }

  onSortChange(): void {
    this.loadDrugs();
  }

  openModal(drug: PublicDrug): void {
    this.selectedDrug = drug;
    document.body.style.overflow = 'hidden';
  }

  closeModal(): void {
    this.selectedDrug = null;
    document.body.style.overflow = '';
  }

  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }

  getTypeIcon(type?: string): string {
    if (!type) return '💊';
    const lowerType = type.toLowerCase();
    if (lowerType.includes('liquid') || lowerType.includes('suspension') || lowerType.includes('syrup')) {
      return '🧪';
    } else if (lowerType.includes('injection')) {
      return '💉';
    } else if (lowerType.includes('capsule')) {
      return '💊';
    } else if (lowerType.includes('tablet')) {
      return '⚪';
    }
    return '💊';
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  toggleLanguage(): void {
    this.translationService.toggleLanguage();
  }
}

