import axios from 'axios';
import { API_URL, Annotation, Organization, Tag, Role, User } from '.';
import { Interval } from './objects';

const get = <T>(url: string): Promise<T> => {
  const jwt = localStorage.getItem('auth_token');
  return axios
    .get<T>(`${API_URL}/${url}`, {
      headers: { Authorization: `Bearer ${jwt}` }
    })
    .then(res => res.data);
};

const post = <T>(url: string, values: any): Promise<T> => {
  const jwt = localStorage.getItem('auth_token');
  return axios
    .post<T>(`${API_URL}/${url}`, values, {
      headers: { Authorization: `Bearer ${jwt}` }
    })
    .then(res => res.data);
};

const del = <T>(url: string): Promise<T> => {
  const jwt = localStorage.getItem('auth_token');
  return axios
    .delete(`${API_URL}/${url}`, {
      headers: { Authorization: `Bearer ${jwt}` }
    })
    .then(res => res.data);
};

const put = <T>(url: string, values: any): Promise<T> => {
  const jwt = localStorage.getItem('auth_token');
  return axios
    .put(`${API_URL}/${url}`, values, {
      headers: { Authorization: `Bearer ${jwt}` }
    })
    .then(res => res.data);
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

export const sendInterval = (datas: Interval): Promise<Interval> => {
  return post<Interval>(`${urls.intervals}`, datas);
};

export const sendIntervalComment = (datas: Interval): Promise<Interval> => {
  return post<Interval>(`${urls.intervalsComment}`, datas);
};

export const sendIntervalTags = (datas: Interval): Promise<Interval> => {
  return post<Interval>(`${urls.intervalsTags}`, datas);
};

export const sendUser = (datas: User): Promise<User> => {
  return post<User>(`${urls.users}`, datas);
};

export const changeAnnotation = (datas: Annotation): Promise<Annotation> => {
  const d: any = {
    ...datas,
    status_id: datas.status.id,
    organization_id: datas.organization ? datas.organization.id : undefined,
    parent_id: datas.parent ? datas.parent.id : undefined,
    tags_id: datas.tags.map(t => t.id),
    tags: undefined,
    status: undefined,
    organization: undefined,
    parent: undefined
  };
  return put<Annotation>(`${urls.annotations}`, d);
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

export const getAllUsers = (): Promise<User[]> => {
  return get<User[]>(urls.users);
};

export const modifyUser = (datas: User): Promise<User> => {
  return put<User>(`${urls.users}`, datas);
};

export const deleteUser = (datas: User): Promise<User> => {
  return del(`${urls.users}/${datas.id}`);
};

const urls = {
  annotations: 'annotations',
  organizations: 'organizations',
  tags: 'tags',
  signal: 'signal',
  roles: 'roles',
  users: 'users',
  intervals: 'intervals',
  intervalsTags: 'intervals/tags',
  intervalsComment: 'intervals/comment'
};
