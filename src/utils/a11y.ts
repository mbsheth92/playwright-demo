/*
* Util functions for locators (role-first + exact matching).
*/
export const exact = (s: string) =>
  new RegExp(`^${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`)

export const byRole = {
  button:  (root: any, name: string) => root.getByRole('button',  { name: exact(name) }),
  link:    (root: any, name: string) => root.getByRole('link',    { name: exact(name) }),
  heading: (root: any, name: string) => root.getByRole('heading', { name: exact(name) }),
  img:     (root: any, name: string) => root.getByRole('img',     { name: exact(name) }),
  textbox: (root: any, name: string) => root.getByRole('textbox', { name: exact(name) }),
};
