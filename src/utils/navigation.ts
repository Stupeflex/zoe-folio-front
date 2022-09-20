import { Project } from '@/store/projectData';
import { gsap, Power3 } from 'gsap';

export const generateProjectLink = (project: Project) =>
  `/project/${project.id}/${project.title.replaceAll(' ', '-').toLowerCase()}`;

export const unit = 12;
export const cellWidth = () => (window.innerWidth - unit) / 19 - unit;
export const cellHeight = () => (window.innerHeight - unit) / 12 - unit;

export const transitionToProjectPage = (
  img?: HTMLDivElement,
  info?: HTMLDivElement,
  redirect?: () => void
) => {
  if (img && info) {
    const tl = gsap.timeline({
      onComplete: redirect,
      defaults: {
        overwrite: false,
      },
    });
    transitionProjectThumbnail(img, tl);
    transitionProjectInfo(info, tl);
  }
};

export const transitionProjectThumbnail = (
  img: HTMLDivElement,
  tl: gsap.core.Timeline
) => {
  const rect = img.getBoundingClientRect();
  // generate needed scale and position to fill screen;
  img.style.minHeight = rect.height + 'px';
  const scaleX = window.innerWidth / rect.width;
  const scaleY = (window.innerHeight - cellHeight() - unit * 2) / rect.height;
  const scale = Math.max(scaleX, scaleY);
  img.classList.add('transition');
  tl.to(
    img,
    {
      x: -rect.x,
      y: -rect.y,
      scale,
      duration: 0.9,
      ease: Power3.easeInOut,
    },
    0
  );
};

export const transitionProjectInfo = (
  info: HTMLDivElement,
  tl: gsap.core.Timeline
) => {
  const rect = info.getBoundingClientRect();
  info.classList.add('transition');

  const x = -rect.x + cellWidth() * 6 + unit * 7;
  const y = -rect.y + cellHeight() * 7 + unit * 8;
  tl.to(
    info,
    {
      x,
      y,
      duration: 0.6,
      ease: Power3.easeInOut,
    },
    0
  );
};
