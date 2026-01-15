import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="content" style="background: transparent;">
      <div class="pill">
        <div class="medicine">
          @for (item of pills; track $index) {
            <i></i>
          }
        </div>
        <div class="side"></div>
        <div class="side"></div>
      </div>
    </div>
  `,
  styles: [`
    .content {
      width: 20vmin;
      height: 20vmin;
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .pill {
      background: transparent;
      width: 6vmin;
      height: 16vmin;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      transform: rotate(180deg);
      animation: spin 4s linear 0s infinite;
    }

    @keyframes spin {
      100% {
        transform: rotate(-540deg);
      }
    }

    .pill .side {
      background: var(--sidebar-bg, #003032);
      position: relative;
      overflow: hidden;
      width: 4.4vmin;
      height: 6vmin;
      border-radius: 2.4vmin 2.4vmin 0 0;
    }

    .pill .side + .side {
      background: var(--sidebar-bg, #003032);
      border-radius: 0 0 2.4vmin 2.4vmin;
      border-top: 0.4vmin solid var(--sidebar-text, #D9F275);
      animation: open 2s ease-in-out 0s infinite;
    }

    @keyframes open {
      0%,
      20%,
      80%,
      100% {
        margin-top: 0;
      }
      30%,
      70% {
        margin-top: 4vmin;
      }
    }

    .pill .side:before {
      content: "";
      position: absolute;
      width: 0.8vmin;
      height: 4vmin;
      bottom: 0;
      right: 0.6vmin;
      background: var(--sidebar-text, #D9F275);
      opacity: 0.2;
      border-radius: 0.4vmin 0.4vmin 0 0;
      animation: shine 1s ease-out -1s infinite alternate-reverse;
    }

    .pill .side + .side:before {
      bottom: inherit;
      top: 0;
      border-radius: 0 0 0.4vmin 0.4vmin;
    }

    .pill .side:after {
      content: "";
      position: absolute;
      width: 100%;
      height: 100%;
      bottom: 0;
      left: 0;
      border-radius: 2.4vmin 2.4vmin 0 0;
      border: 0.7vmin solid rgba(0, 0, 0, 0.13);
      border-bottom-color: transparent;
      border-bottom-width: 0vmin;
      border-top-width: 0.4vmin;
      animation: shadow 1s ease -1s infinite alternate-reverse;
    }

    .pill .side + .side:after {
      bottom: inherit;
      top: 0;
      border-radius: 0 0 2.4vmin 2.4vmin;
      border-top-color: transparent;
      border-top-width: 0vmin;
      border-bottom-width: 0.4vmin;
    }

    @keyframes shine {
      0%,
      46% {
        right: 0.6vmin;
      }
      54%,
      100% {
        right: 3vmin;
      }
    }

    @keyframes shadow {
      0%,
      49.999% {
        transform: rotateY(0deg);
        left: 0;
      }
      50%,
      100% {
        transform: rotateY(180deg);
        left: -1.2vmin;
      }
    }

    .medicine {
      position: absolute;
      width: calc(100% - 2.4vmin);
      height: calc(100% - 4.8vmin);
      background: transparent;
      border-radius: 2vmin;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
    }

    .medicine i {
      width: 1vmin;
      height: 1vmin;
      background: var(--sidebar-text, #D9F275);
      border-radius: 100%;
      position: absolute;
      animation: medicine-dust 1.75s ease 0s infinite alternate;
    }

    .medicine i:nth-child(2n + 2) {
      width: 1.5vmin;
      height: 1.5vmin;
      margin-top: -5vmin;
      margin-right: -5vmin;
      animation-delay: -0.2s;
    }

    .medicine i:nth-child(3n + 3) {
      width: 2vmin;
      height: 2vmin;
      margin-top: 4vmin;
      margin-right: 3vmin;
      animation-delay: -0.33s;
    }

    .medicine i:nth-child(4) {
      margin-top: -5vmin;
      margin-right: 4vmin;
      animation-delay: -0.4s;
    }

    .medicine i:nth-child(5) {
      margin-top: 5vmin;
      margin-right: -4vmin;
      animation-delay: -0.5s;
    }

    .medicine i:nth-child(6) {
      margin-top: 0vmin;
      margin-right: -3.5vmin;
      animation-delay: -0.66s;
    }

    .medicine i:nth-child(7) {
      margin-top: -1vmin;
      margin-right: 7vmin;
      animation-delay: -0.7s;
    }

    .medicine i:nth-child(8) {
      margin-top: 6vmin;
      margin-right: -1vmin;
      animation-delay: -0.8s;
    }

    .medicine i:nth-child(9) {
      margin-top: 4vmin;
      margin-right: -7vmin;
      animation-delay: -0.99s;
    }

    .medicine i:nth-child(10) {
      margin-top: -6vmin;
      margin-right: 0vmin;
      animation-delay: -1.11s;
    }

    .medicine i:nth-child(1n + 10) {
      width: 0.6vmin;
      height: 0.6vmin;
    }

    .medicine i:nth-child(11) {
      margin-top: 6vmin;
      margin-right: 6vmin;
      animation-delay: -1.125s;
    }

    .medicine i:nth-child(12) {
      margin-top: -7vmin;
      margin-right: -7vmin;
      animation-delay: -1.275s;
    }

    .medicine i:nth-child(13) {
      margin-top: -1vmin;
      margin-right: 3vmin;
      animation-delay: -1.33s;
    }

    .medicine i:nth-child(14) {
      margin-top: -3vmin;
      margin-right: -1vmin;
      animation-delay: -1.4s;
    }

    .medicine i:nth-child(15) {
      margin-top: -1vmin;
      margin-right: -7vmin;
      animation-delay: -1.55s;
    }

    @keyframes medicine-dust {
      0%,
      100% {
        transform: translate3d(0vmin, 0vmin, -0.1vmin);
      }
      25% {
        transform: translate3d(0.25vmin, 5vmin, 0vmin);
      }
      75% {
        transform: translate3d(-0.1vmin, -4vmin, 0.25vmin);
      }
    }
  `]
})
export class LoadingComponent {
  pills = Array(20).fill(0);
}


