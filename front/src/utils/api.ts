import axios from 'axios';
import { API_URL, Annotation, Organization, Tag, Role, User, Status } from '.';
import { Interval, AnnotationComments, StatusInserter } from './objects';

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
  return get<Annotation[]>(urls.annotations).then(annotations => {
    annotations.forEach((a: Annotation) => {
      a.creation_date = new Date(a.creation_date);
      if (a.edit_date) {
        a.edit_date = new Date(a.edit_date);
      }
      if (a.status) {
        a.status.forEach((s: Status) => (s.date = new Date(s.date)));
      }
    });
    return annotations;
  });
};

export const getAnnotationById = (id: number): Promise<Annotation> => {
  return get<Annotation>(`${urls.annotation}/${id}`).then(annotation => {
    annotation.creation_date = new Date(annotation.creation_date);
    if (annotation.edit_date) {
      annotation.edit_date = new Date(annotation.edit_date);
    }
    if (annotation.status) {
      annotation.status.forEach((s: Status) => (s.date = new Date(s.date)));
    }
    return annotation;
  });
};

export const sendAnnotation = (datas: Annotation): Promise<Annotation> => {
  return post<Annotation>(`${urls.annotations}`, datas);
};

export const sendInterval = (datas: Interval): Promise<Interval> => {
  return post<Interval>(`${urls.interval}`, datas);
};

export const sendIntervalComment = (datas: Interval): Promise<Interval> => {
  return post<Interval>(`${urls.intervalComment}`, datas);
};

export const sendIntervalTags = (datas: Interval): Promise<Interval> => {
  return post<Interval>(`${urls.intervalTags}`, datas);
};

export const sendUser = (datas: User): Promise<User> => {
  return post<User>(`${urls.users}`, datas);
};

export const changeAnnotation = (datas: Annotation): Promise<Annotation> => {
  const d: any = {
    ...datas,
    organization_id: datas.organization ? datas.organization.id : undefined,
    parent_id: datas.parent ? datas.parent.id : undefined,
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

export const getCommentsOnAnnotationById = (
  id: number
): Promise<AnnotationComments> => {
  return get<AnnotationComments>(`${urls.annotationComments}/${id}`);
};

export const sendStatus = (s: StatusInserter): Promise<StatusInserter> => {
  return post<StatusInserter>(`${urls.status}`, s);
};

const urls = {
  annotation: 'annotation',
  annotations: 'annotations',
  annotationComments: 'annotation/comments',
  organizations: 'organizations',
  tags: 'tags',
  signal: 'signal',
  status: 'status',
  roles: 'roles',
  users: 'users',
  interval: 'interval',
  intervalComment: 'interval/comment',
  intervalTags: 'interval/tags'
};
