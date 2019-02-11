import axios from 'axios';
import { API_URL, Annotation, Organization, Tag, Role, User } from '.';

export const get = <T>(url: string): Promise<T> => {
  return axios.get<T>(`${API_URL}/${url}`).then(res => res.data);
};

export const post = <T>(url: string, values: T) => {
  return axios.post(`${API_URL}/${url}`, values).then(res => res.data);
};

export const getAnnotations = (): Promise<Annotation[]> => {
  return get<Annotation[]>(urls.annotations);
};

export const getAnnotationById = (id: number): Promise<Annotation> => {
  return get<Annotation>(`${urls.annotations}/${id}`);
};

export const sendAnnotation = (datas: Annotation): Promise<Annotation> => {
  return post<Annotation>(`${urls.annotations}`, datas);
};

export const sendUser = (datas: User): Promise<User> => {
  return post<User>(`${urls.users}`, datas);
};

export const getOrganizations = (): Promise<Organization[]> => {
  return get<Organization[]>(urls.organizations);
};

export const getOrganizationById = (id: number): Promise<Organization> => {
  return get<Organization>(`${urls.organizations}/${id}`);
};

export const getTags = (): Promise<Tag[]> => {
  return get<Tag[]>(urls.tags);
};

export const getTagById = (id: number): Promise<Tag> => {
  return get<Tag>(`${urls.tags}/${id}`);
};

export const checkSignal = (id: number): Promise<any> => {
  return get(`${urls.signal}/${id}`);
};

export const getRoles = (): Promise<Role[]> => {
  return get<Role[]>(urls.roles);
};

const urls = {
  annotations: 'annotations',
  organizations: 'organizations',
  tags: 'tags',
  signal: 'signal',
  roles: 'roles',
  users: 'users'
};
