import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // private apiUrl = 'http://tuapi.com/auth';
  private apiUrl = '../../../assets/data/data.json';

  constructor(private http: HttpClient, private router: Router) {}

  // login(email: string, password: string): Observable<any> {
  //   return this.http.post(this.apiUrl + '/login', { email, password });
  // }
  login(email: any, password: any): Observable<any> {
    return this.http.get<{usuarios: any[]}>(this.apiUrl).pipe(
      map(response => {
        const user = response.usuarios.find(u => u.email === email && u.password === password);
        if (user) {
          localStorage.setItem('user', JSON.stringify({ email: user.email }));
          return { success: true, message: 'Login exitoso' };
        } else {
          throw new Error('Credenciales inválidas');
        }
      }),
      catchError(error => of({ success: false, message: error.message }))
    );
  }
  logout() {
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
  isLoggedIn(): boolean {
    return !!localStorage.getItem('user');
  }
}
