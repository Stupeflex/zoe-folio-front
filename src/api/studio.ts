import client from '@/api/client';
import { StudioData, StudioData_Raw } from '@/api/types';
import { formatRawMediaArray } from '@/api/projects';

export const fetchStudio = (): Promise<StudioData> => {
  return client('/studio-section?populate=*-nested').then(
    (raw: StudioData_Raw) => formatStudioData(raw)
  );
};

const formatStudioData = (raw: StudioData_Raw): StudioData => {
  const data = raw.data.attributes;
  console.log(data);

  const photos = formatRawMediaArray(data.photos, (m) => ({ title: m.title }));
  return {
    ...data,
    photos,
  };
};
