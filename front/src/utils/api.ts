import axios from 'axios';
import { API_URL } from '.';
import { Annotation } from '../pages/Dashboard';

export const get = <T>(url: string): Promise<T> => {
  return axios.get<T>(`${API_URL}/${url}`).then(res => res.data);
};

export const post = <T>(url: string, values: T) => {
  return axios.post(`${API_URL}/${url}`, values).then(res => res.data);
};

export const getAnnotations = (): Promise<Annotation[]> => {
  return get<Annotation[]>(urls.annotations);
};

export const getAnnotationById = (id: number) => {
  return get<Annotation>(`${urls.annotations}/${id}`);
};

export const getOrganizations = () => {
  return get(urls.organizations);
};

export const getOrganizationById = (id: number) => {
  return get(`${urls.organizations}/${id}`);
};

export const getTags = () => {
  return get(urls.tags);
};

export const getTagById = (id: number) => {
  return get(`${urls.tags}/${id}`);
};

const urls = {
  annotations: 'annotations',
  organizations: 'organizations',
  tags: 'tags'
};
