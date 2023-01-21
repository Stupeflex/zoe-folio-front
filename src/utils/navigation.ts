import { Project } from '@/store/projectData';
import { gsap, Power3 } from 'gsap';
import {
  cellHeight,
  cellWidth,
  responsiveValue,
  unit,
} from '@/utils/responsive';
import { ScrollSectionId } from '@/store/scrollData';
import { gridLength } from '@/utils/grid';

export const generateProjectLink = (project: Project) =>
  `/project/${project.id}/${project.title.replaceAll(' ', '-').toLowerCase()}`;

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
  // remove pointer events
  img.style.pointerEvents = 'none';
  // generate needed scale and position to fill screen;
  img.style.minHeight = rect.height + 'px';
  const scaleX = window.innerWidth / rect.width;
  const scaleY =
    (window.innerHeight - cellHeight() * 2 - unit() * 3) / rect.height;
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
  info.style.pointerEvents = 'none';

  const rows = responsiveValue({
    default: 7,
    tablet: 4,
    mobile: 2,
  });

  const columns = responsiveValue({
    default: 7,
    tablet: 8,
    mobile: 2,
  });

  const width = gridLength(
    responsiveValue({
      default: 12,
      tablet: 12,
      mobile: 7,
    }),
    'x'
  );

  const x = -rect.x + cellWidth() * (rows - 1) + unit() * rows;
  const y = -rect.y + cellHeight() * (columns - 1) + unit() * columns;
  tl.to(
    info,
    {
      x,
      y,
      width,
      duration: 0.6,
      ease: Power3.easeInOut,
    },
    0
  );
};

type navLink = {
  title: string;
  to: string;
  identifier?: string;
  id: ScrollSectionId;
  [key: string]: string | undefined;
};

export const sectionLinks: navLink[] = [
  {
    title: 'nav.projects',
    to: '/#projects',
    identifier: '#section__projects',
    id: 'projects',
  },
  {
    title: 'nav.process',
    to: '/#process',
    identifier: '#section__process',
    id: 'process',
  },
  {
    title: 'nav.studio',
    to: '/#studio',
    identifier: '#section__studio',
    id: 'studio',
  },
  {
    title: 'nav.about',
    to: '/#about',
    identifier: '#section__about',
    id: 'about',
  },
];

export const adminPanelLinks: navLink[] = [
  {
    title: 'nav.adminDashboard',
    to: '/admin',
    identifier: '#section__dashboard',
    id: 'dashboard',
  },
  {
    title: 'nav.projectManagement',
    to: '/admin/projects',
    identifier: '#section__projects',
    id: 'projects',
  },
  {
    title: 'nav.clients',
    to: '/admin/clients',
    identifier: '#section__clients',
    id: 'clients',
  },
  {
    title: 'nav.content',
    to: '/admin/content',
    identifier: '#section__content',
    id: 'content',
  },
  {
    title: 'nav.usage',
    to: '/admin/usage',
    identifier: '#section__usage',
    id: 'usage',
  },
];
