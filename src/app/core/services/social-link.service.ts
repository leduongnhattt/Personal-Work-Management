import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { CreateMultipleSocialLinksDTO, SocialLink, UpdateSocialLinkDTO } from '../models/social-link.model';
@Injectable({
  providedIn: 'root'
})
export class SocialLinkService {
  constructor(private http: HttpClient) { }

  getUserSocialLinks(): Observable<{ data: SocialLink[], status: string }> {
    return this.http.get<{ data: SocialLink[], status: string }>(environment.apiSocialLinkUrl);
  }

  addMultipleSocialLinks(socialLinks: CreateMultipleSocialLinksDTO): Observable<{ data: SocialLink[], status: string, message: string }> {
    return this.http.post<{ data: SocialLink[], status: string, message: string }>(`${environment.apiSocialLinkUrl}/multiple`, socialLinks);
  }

  updateSocialLink(socialLinkId: string, socialLink: UpdateSocialLinkDTO): Observable<{ data: SocialLink, status: string, message: string }> {
    return this.http.put<{ data: SocialLink, status: string, message: string }>(`${environment.apiSocialLinkUrl}/${socialLinkId}`, socialLink);
  }

  deleteSocialLink(socialLinkId: string): Observable<{ status: string, message: string }> {
    return this.http.delete<{ status: string, message: string }>(`${environment.apiSocialLinkUrl}/${socialLinkId}`);
  }
}
