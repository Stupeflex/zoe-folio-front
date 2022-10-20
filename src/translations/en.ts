import type { Translation } from '@/translations/index';

export const en: Translation = {
  titles: {
    projects: 'Color grading\nprojects',
    process: 'Process',
    studio: 'Creative studio\nin Paris',
    about: 'About',
  },
  filters: {
    clips: 'Music',
    pubs: 'Advertising',
    fiction: 'Fiction',
  },
  nav: {
    projects: 'Projects',
    process: 'Process',
    studio: 'Studio',
    about: 'About',
    contact: 'Contact',
    back: 'Back',
    hook: 'Got a project for me? Let\'s get in touch!', // eslint-disable-line prettier/prettier
    projectManagement: 'Project Management',
  },
  sections: {
    studio: {
      address: '24, Rue de Saint Antoine\n4ème arrondissement\n75004 Paris',
      hook: 'Entre brainstorming et ajustements de courbes, le studio sait s’effacer pour laisser libre court à la vision de vos projets.',
      cta: 'Book a session',
    },
    about: {
      clients: 'Selected clients',
    },
  },
  project: {
    type: {
      clip: 'Music video',
      pub: 'Advertising',
      fiction: 'Fiction',
    },
    next: 'Next project',
    scroll: 'Scroll',
    sound: {
      on: 'Sound on',
      off: 'Sound off',
    },
  },
};
