import { Injectable, signal, computed, effect } from '@angular/core';
import { PharmacyDrug } from '../models/drug.model';

const STORAGE_KEY = 'pharmly_invoice_cart';

@Injectable({
  providedIn: 'root'
})
export class InvoiceCartService {
  private readonly _drugs = signal<PharmacyDrug[]>(this.loadFromStorage());

  // Public readonly signal
  readonly drugs = this._drugs.asReadonly();

  // Computed signal for checking if cart has drugs
  readonly hasDrugs = computed(() => this._drugs().length > 0);

  // Computed signal for cart count
  readonly count = computed(() => this._drugs().length);

  constructor() {
    // Listen to changes and persist to sessionStorage using effect
    effect(() => {
      const drugs = this._drugs();
      this.saveToStorage(drugs);
    });
  }

  /**
   * Add a drug to the cart
   * Prevents duplicates by checking drug ID
   */
  addDrug(drug: PharmacyDrug): void {
    const current = this._drugs();
    // Check if drug already exists
    if (!current.find(d => d.id === drug.id)) {
      this._drugs.update(drugs => [...drugs, drug]);
    }
  }

  /**
   * Remove a drug from the cart by ID
   */
  removeDrug(drugId: string): void {
    this._drugs.update(drugs => drugs.filter(d => d.id !== drugId));
  }

  /**
   * Clear all drugs from the cart
   */
  clear(): void {
    this._drugs.set([]);
  }

  /**
   * Get the current drugs in the cart (readonly)
   */
  getDrugs(): readonly PharmacyDrug[] {
    return this._drugs();
  }

  /**
   * Check if a specific drug is in the cart
   */
  hasDrug(drugId: string): boolean {
    return this._drugs().some(d => d.id === drugId);
  }

  /**
   * Load cart from sessionStorage
   */
  private loadFromStorage(): PharmacyDrug[] {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        return parsed.map((drug: any) => ({
          ...drug,
          expiryDate: drug.expiryDate ? new Date(drug.expiryDate) : undefined,
          createdAt: drug.createdAt ? new Date(drug.createdAt) : new Date(),
          updatedAt: drug.updatedAt ? new Date(drug.updatedAt) : new Date(),
          costLayers: drug.costLayers?.map((layer: any) => ({
            ...layer,
            purchaseDate: layer.purchaseDate ? new Date(layer.purchaseDate) : new Date(),
            expiryDate: layer.expiryDate ? new Date(layer.expiryDate) : undefined
          })) || []
        }));
      }
    } catch (error) {
      console.error('Failed to load cart from sessionStorage:', error);
    }
    return [];
  }

  /**
   * Save cart to sessionStorage
   */
  private saveToStorage(drugs: PharmacyDrug[]): void {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(drugs));
    } catch (error) {
      console.error('Failed to save cart to sessionStorage:', error);
    }
  }
}

