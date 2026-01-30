import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Apartment, Room, Booking, Review, Rating,
  ApiResponse, ApiListResponse
} from '../models/hotel.models';

@Injectable({
  providedIn: 'root'
})
export class HotelService {
  private baseUrl = '/adapters/hotel';

  constructor(private http: HttpClient) { }

  // ============ APARTMENTS ============
  
  createApartment(apartment: Apartment): Observable<ApiResponse<Apartment>> {
    return this.http.post<ApiResponse<Apartment>>(`${this.baseUrl}/apartments/`, apartment);
  }

  getApartments(): Observable<ApiListResponse<Apartment>> {
    return this.http.get<ApiListResponse<Apartment>>(`${this.baseUrl}/apartments/`);
  }

  getApartmentById(apartmentId: string): Observable<ApiResponse<Apartment>> {
    return this.http.get<ApiResponse<Apartment>>(`${this.baseUrl}/apartments/${apartmentId}`);
  }

  updateApartment(apartmentId: string, apartment: Apartment): Observable<ApiResponse<Apartment>> {
    return this.http.put<ApiResponse<Apartment>>(`${this.baseUrl}/apartments/${apartmentId}`, apartment);
  }

  deleteApartment(apartmentId: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/apartments/${apartmentId}`);
  }

  // ============ ROOMS ============

  createRoom(room: Room): Observable<ApiResponse<Room>> {
    return this.http.post<ApiResponse<Room>>(`${this.baseUrl}/rooms/room`, room);
  }

  getRooms(): Observable<ApiListResponse<Room>> {
    return this.http.get<ApiListResponse<Room>>(`${this.baseUrl}/rooms/rooms`);
  }

  getRoomById(roomId: string): Observable<ApiResponse<Room>> {
    return this.http.get<ApiResponse<Room>>(`${this.baseUrl}/rooms/room/${roomId}`);
  }

  updateRoom(roomId: string, room: Room): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/rooms/room/${roomId}`, room);
  }

  deleteRoom(roomId: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/rooms/room/${roomId}`);
  }

  // ============ BOOKINGS ============

  createBooking(booking: Booking): Observable<ApiResponse<Booking>> {
    return this.http.post<ApiResponse<Booking>>(`${this.baseUrl}/bookings/booking`, booking);
  }

  getBookingById(bookingId: string): Observable<ApiResponse<Booking>> {
    return this.http.get<ApiResponse<Booking>>(`${this.baseUrl}/bookings/booking/${bookingId}`);
  }

  getBookings(): Observable<ApiListResponse<Booking>> {
    return this.http.get<ApiListResponse<Booking>>(`${this.baseUrl}/bookings/bookings`);
  }

  updateBooking(bookingId: string, booking: Booking): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/bookings/booking/${bookingId}`, booking);
  }

  deleteBooking(bookingId: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/bookings/booking/${bookingId}`);
  }

  cancelBooking(bookingId: string): Observable<ApiResponse<Booking>> {
    return this.http.patch<ApiResponse<Booking>>(`${this.baseUrl}/bookings/booking/${bookingId}/cancel`, {});
  }

  // ============ REVIEWS ============

  createReview(review: Review): Observable<ApiResponse<Review>> {
    return this.http.post<ApiResponse<Review>>(`${this.baseUrl}/reviews/review`, review);
  }

  getReviewById(reviewId: string): Observable<ApiResponse<Review>> {
    return this.http.get<ApiResponse<Review>>(`${this.baseUrl}/reviews/review/${reviewId}`);
  }

  getReviews(): Observable<ApiListResponse<Review>> {
    return this.http.get<ApiListResponse<Review>>(`${this.baseUrl}/reviews/reviews`);
  }

  updateReview(reviewId: string, review: Review): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/reviews/review/${reviewId}`, review);
  }

  deleteReview(reviewId: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/reviews/review/${reviewId}`);
  }

  // ============ RATINGS ============

  createRating(rating: Rating): Observable<ApiResponse<Rating>> {
    return this.http.post<ApiResponse<Rating>>(`${this.baseUrl}/ratings/rating`, rating);
  }

  getRatingById(ratingId: string): Observable<ApiResponse<Rating>> {
    return this.http.get<ApiResponse<Rating>>(`${this.baseUrl}/ratings/rating/${ratingId}`);
  }

  getRatings(): Observable<ApiListResponse<Rating>> {
    return this.http.get<ApiListResponse<Rating>>(`${this.baseUrl}/ratings/ratings`);
  }

  updateRating(ratingId: string, rating: Rating): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/ratings/rating/${ratingId}`, rating);
  }

  deleteRating(ratingId: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/ratings/rating/${ratingId}`);
  }

  // ============ HEALTH ============

  healthCheck(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/health/`);
  }

  getVersion(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/version`);
  }
}
