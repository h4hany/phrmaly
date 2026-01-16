import { Injectable, inject } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { AttendanceRecord, Shift, AttendanceStats } from '../models/hr.model';
import { PaginatedResponse, PaginationParams } from '../models/common.model';
import { PharmacyContextService } from './pharmacy-context.service';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private pharmacyContextService = inject(PharmacyContextService);

  private shifts: Shift[] = [
    {
      id: 'SH001',
      pharmacyId: 'ph1',
      staffId: 'ST001',
      staffName: 'Sarah Johnson',
      shiftDate: new Date('2024-11-27'),
      startTime: new Date('2024-11-27T08:00:00'),
      endTime: new Date('2024-11-27T17:00:00'),
      status: 'completed',
      checkInTime: new Date('2024-11-27T07:55:00'),
      checkOutTime: new Date('2024-11-27T17:05:00'),
      checkInMethod: 'qr',
      checkOutMethod: 'qr',
      createdAt: new Date('2024-11-27'),
      updatedAt: new Date('2024-11-27'),
      createdBy: 'system'
    },
    {
      id: 'SH002',
      pharmacyId: 'ph1',
      staffId: 'ST002',
      staffName: 'Michael Chen',
      shiftDate: new Date('2024-11-27'),
      startTime: new Date('2024-11-27T09:00:00'),
      endTime: new Date('2024-11-27T18:00:00'),
      status: 'in_progress',
      checkInTime: new Date('2024-11-27T09:15:00'),
      checkInMethod: 'pin',
      createdAt: new Date('2024-11-27'),
      updatedAt: new Date('2024-11-27'),
      createdBy: 'system'
    }
  ];

  private attendanceRecords: AttendanceRecord[] = [
    {
      id: 'ATT001',
      pharmacyId: 'ph1',
      staffId: 'ST001',
      staffName: 'Sarah Johnson',
      date: new Date('2024-11-27'),
      checkInTime: new Date('2024-11-27T07:55:00'),
      checkOutTime: new Date('2024-11-27T17:05:00'),
      totalHours: 9.17,
      status: 'present',
      shiftId: 'SH001',
      createdAt: new Date('2024-11-27'),
      updatedAt: new Date('2024-11-27'),
      createdBy: 'system'
    },
    {
      id: 'ATT002',
      pharmacyId: 'ph1',
      staffId: 'ST002',
      staffName: 'Michael Chen',
      date: new Date('2024-11-27'),
      checkInTime: new Date('2024-11-27T09:15:00'),
      totalHours: 0,
      status: 'late',
      lateMinutes: 15,
      shiftId: 'SH002',
      createdAt: new Date('2024-11-27'),
      updatedAt: new Date('2024-11-27'),
      createdBy: 'system'
    }
  ];

  getShifts(params?: PaginationParams & { staffId?: string; startDate?: Date; endDate?: Date }): Observable<PaginatedResponse<Shift>> {
    const pharmacyId = this.pharmacyContextService.getCurrentPharmacy()?.id;
    if (!pharmacyId) {
      return of({ data: [], total: 0, page: 1, pageSize: 10, totalPages: 0 }).pipe(delay(300));
    }

    let filtered = this.shifts.filter(s => s.pharmacyId === pharmacyId);

    if (params?.staffId) {
      filtered = filtered.filter(s => s.staffId === params.staffId);
    }

    if (params?.startDate) {
      filtered = filtered.filter(s => s.shiftDate >= params.startDate!);
    }

    if (params?.endDate) {
      filtered = filtered.filter(s => s.shiftDate <= params.endDate!);
    }

    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginated = filtered.slice(start, end);

    return of({
      data: paginated,
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize)
    }).pipe(delay(500));
  }

  getAttendanceRecords(params?: PaginationParams & { staffId?: string; startDate?: Date; endDate?: Date }): Observable<PaginatedResponse<AttendanceRecord>> {
    const pharmacyId = this.pharmacyContextService.getCurrentPharmacy()?.id;
    if (!pharmacyId) {
      return of({ data: [], total: 0, page: 1, pageSize: 10, totalPages: 0 }).pipe(delay(300));
    }

    let filtered = this.attendanceRecords.filter(a => a.pharmacyId === pharmacyId);

    if (params?.staffId) {
      filtered = filtered.filter(a => a.staffId === params.staffId);
    }

    if (params?.startDate) {
      filtered = filtered.filter(a => a.date >= params.startDate!);
    }

    if (params?.endDate) {
      filtered = filtered.filter(a => a.date <= params.endDate!);
    }

    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginated = filtered.slice(start, end);

    return of({
      data: paginated,
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize)
    }).pipe(delay(500));
  }

  checkIn(staffId: string, method: 'qr' | 'pin' = 'qr'): Observable<{ success: boolean; shift?: Shift; message?: string }> {
    const pharmacyId = this.pharmacyContextService.getCurrentPharmacy()?.id;
    if (!pharmacyId) {
      return of({ success: false, message: 'No pharmacy selected' }).pipe(delay(300));
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find or create shift
    let shift = this.shifts.find(s => 
      s.pharmacyId === pharmacyId && 
      s.staffId === staffId && 
      s.shiftDate.getTime() === today.getTime() &&
      s.status === 'scheduled'
    );

    if (!shift) {
      // Create new shift
      shift = {
        id: `SH${Date.now()}`,
        pharmacyId,
        staffId,
        shiftDate: today,
        startTime: new Date(),
        status: 'in_progress',
        checkInTime: new Date(),
        checkInMethod: method,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system'
      };
      this.shifts.push(shift);
    } else {
      shift.status = 'in_progress';
      shift.checkInTime = new Date();
      shift.checkInMethod = method;
      shift.updatedAt = new Date();
    }

    // Create attendance record
    const attendanceRecord: AttendanceRecord = {
      id: `ATT${Date.now()}`,
      pharmacyId,
      staffId,
      date: today,
      checkInTime: new Date(),
      status: 'present',
      shiftId: shift.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system'
    };
    this.attendanceRecords.push(attendanceRecord);

    return of({ success: true, shift }).pipe(delay(500));
  }

  checkOut(staffId: string, method: 'qr' | 'pin' = 'qr'): Observable<{ success: boolean; shift?: Shift; message?: string }> {
    const pharmacyId = this.pharmacyContextService.getCurrentPharmacy()?.id;
    if (!pharmacyId) {
      return of({ success: false, message: 'No pharmacy selected' }).pipe(delay(300));
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const shift = this.shifts.find(s => 
      s.pharmacyId === pharmacyId && 
      s.staffId === staffId && 
      s.shiftDate.getTime() === today.getTime() &&
      s.status === 'in_progress'
    );

    if (!shift) {
      return of({ success: false, message: 'No active shift found' }).pipe(delay(300));
    }

    shift.status = 'completed';
    shift.checkOutTime = new Date();
    shift.checkOutMethod = method;
    shift.endTime = new Date();
    shift.updatedAt = new Date();

    // Update attendance record
    const attendanceRecord = this.attendanceRecords.find(a => 
      a.pharmacyId === pharmacyId && 
      a.staffId === staffId && 
      a.date.getTime() === today.getTime()
    );

    if (attendanceRecord) {
      attendanceRecord.checkOutTime = new Date();
      if (attendanceRecord.checkInTime) {
        const hours = (attendanceRecord.checkOutTime.getTime() - attendanceRecord.checkInTime.getTime()) / (1000 * 60 * 60);
        attendanceRecord.totalHours = Math.round(hours * 100) / 100;
      }
      attendanceRecord.updatedAt = new Date();
    }

    return of({ success: true, shift }).pipe(delay(500));
  }

  getAttendanceStats(staffId: string, startDate: Date, endDate: Date): Observable<AttendanceStats> {
    const pharmacyId = this.pharmacyContextService.getCurrentPharmacy()?.id;
    if (!pharmacyId) {
      return of({
        staffId,
        staffName: '',
        totalDays: 0,
        presentDays: 0,
        absentDays: 0,
        lateDays: 0,
        attendancePercentage: 0,
        averageHoursPerDay: 0,
        period: { startDate, endDate }
      }).pipe(delay(300));
    }

    const records = this.attendanceRecords.filter(a => 
      a.pharmacyId === pharmacyId && 
      a.staffId === staffId &&
      a.date >= startDate &&
      a.date <= endDate
    );

    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const presentDays = records.filter(r => r.status === 'present').length;
    const absentDays = records.filter(r => r.status === 'absent').length;
    const lateDays = records.filter(r => r.status === 'late').length;
    const totalHours = records.reduce((sum, r) => sum + (r.totalHours || 0), 0);

    const stats: AttendanceStats = {
      staffId,
      staffName: records[0]?.staffName || '',
      totalDays,
      presentDays,
      absentDays,
      lateDays,
      attendancePercentage: totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0,
      averageHoursPerDay: presentDays > 0 ? Math.round((totalHours / presentDays) * 100) / 100 : 0,
      period: { startDate, endDate }
    };

    return of(stats).pipe(delay(500));
  }

  createShift(shift: Omit<Shift, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Observable<Shift> {
    const pharmacyId = this.pharmacyContextService.getCurrentPharmacy()?.id;
    if (!pharmacyId) {
      throw new Error('No pharmacy selected');
    }

    const newShift: Shift = {
      ...shift,
      id: `SH${Date.now()}`,
      pharmacyId,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system'
    };

    this.shifts.push(newShift);
    return of(newShift).pipe(delay(500));
  }
}

