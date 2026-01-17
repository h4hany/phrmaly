import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, inject, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TranslationService } from '../../../core/services/translation.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class HomepageComponent implements OnInit, AfterViewInit, OnDestroy {
  private router = inject(Router);
  private translationService = inject(TranslationService);
  @ViewChild('particleCanvas', { static: false }) particleCanvas!: ElementRef<HTMLCanvasElement>;
  
  private particles: any[] = [];
  private animationFrameId?: number;
  private mobileMenuOpen = false;
  currentLanguage: 'en' | 'ar' = 'en';

  ngOnInit(): void {
    // Add Google Fonts
    this.loadGoogleFonts();
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
    this.initScrollAnimations();
    this.initStatsCounter();
    this.initSmoothScrolling();
    this.init3DTiltEffects();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private loadGoogleFonts(): void {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&display=swap';
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

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.opacity = Math.random() * 0.5 + 0.2;
      }

      update(): void {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }

      draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = `rgba(0, 212, 170, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    this.particles = [];
    for (let i = 0; i < 100; i++) {
      this.particles.push(new Particle());
    }

    const connectParticles = () => {
      for (let a = 0; a < this.particles.length; a++) {
        for (let b = a + 1; b < this.particles.length; b++) {
          const dx = this.particles[a].x - this.particles[b].x;
          const dy = this.particles[a].y - this.particles[b].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.strokeStyle = `rgba(0, 212, 170, ${0.1 * (1 - distance / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(this.particles[a].x, this.particles[a].y);
            ctx.lineTo(this.particles[b].x, this.particles[b].y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      this.particles.forEach(particle => {
        particle.update();
        particle.draw(ctx);
      });

      connectParticles();
      this.animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
  }

  private initScrollAnimations(): void {
    // Scroll reveal animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('revealed');
          }, index * 100);
        }
      });
    }, observerOptions);

    setTimeout(() => {
      document.querySelectorAll('.scroll-reveal').forEach((el) => {
        observer.observe(el);
      });
    }, 100);

    // Scroll progress bar
    window.addEventListener('scroll', () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      const progressBar = document.getElementById('scrollProgress');
      if (progressBar) {
        progressBar.style.width = scrolled + '%';
      }
    });

    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    if (navbar) {
      window.addEventListener('scroll', () => {
        if (window.pageYOffset > 100) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      });
    }
  }

  private initStatsCounter(): void {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const statNumbers = entry.target.querySelectorAll('.stat-number');
          statNumbers.forEach(stat => {
            const targetStr = (stat as HTMLElement).dataset['target'];
            const suffix = (stat as HTMLElement).dataset['suffix'] || '';
            if (targetStr) {
              const target = parseFloat(targetStr);
              this.animateCounter(stat as HTMLElement, target, suffix);
            }
          });
          statsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    setTimeout(() => {
      const statsSection = document.querySelector('.stats');
      if (statsSection) {
        statsObserver.observe(statsSection);
      }
    }, 100);
  }

  private animateCounter(element: HTMLElement, target: number, suffix: string, duration = 2000): void {
    let start = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        element.textContent = target + suffix;
        clearInterval(timer);
      } else {
        if (suffix.includes('.')) {
          element.textContent = start.toFixed(1) + suffix.slice(suffix.indexOf('.') + 2);
        } else {
          element.textContent = Math.floor(start) + suffix;
        }
      }
    }, 16);
  }

  private initSmoothScrolling(): void {
    setTimeout(() => {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e: Event) => {
          e.preventDefault();
          const href = (e.currentTarget as HTMLAnchorElement).getAttribute('href');
          if (href) {
            const target = document.querySelector(href);
            if (target) {
              const offsetTop = (target as HTMLElement).offsetTop - 80;
              window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
              });
            }
          }
        });
      });
    }, 100);
  }

  private init3DTiltEffects(): void {
    setTimeout(() => {
      document.querySelectorAll('.feature-card, .pricing-card').forEach(card => {
        card.addEventListener('mousemove', (e: Event) => {
          const mouseEvent = e as MouseEvent;
          const rect = (card as HTMLElement).getBoundingClientRect();
          const x = mouseEvent.clientX - rect.left;
          const y = mouseEvent.clientY - rect.top;
          
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          
          const rotateX = (y - centerY) / 20;
          const rotateY = (centerX - x) / 20;
          
          (card as HTMLElement).style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-20px) scale(1.02)`;
        });

        card.addEventListener('mouseleave', () => {
          (card as HTMLElement).style.transform = '';
        });
      });
    }, 100);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    const navMenu = document.getElementById('navMenu');
    const mobileToggle = document.getElementById('mobileToggle');
    
    if (navMenu && mobileToggle) {
      if (this.mobileMenuOpen) {
        navMenu.classList.add('active');
        mobileToggle.textContent = '✕';
      } else {
        navMenu.classList.remove('active');
        mobileToggle.textContent = '☰';
      }
    }
  }

  navigateToDrugIndex(): void {
    this.router.navigate(['/drug-index']);
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  toggleLanguage(): void {
    this.translationService.toggleLanguage();
  }
}

