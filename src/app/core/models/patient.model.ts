export interface Patient {
  id: string;
  fullName: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  phone: string;
  email?: string;
  address: {
    city: string;
    area: string;
    street: string;
    notes?: string;
  };
  occupation?: string;
  medicalNotes?: string;
  cardId?: string;
  validUntil?: Date;
  issuedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

