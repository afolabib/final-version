// base44 SDK removed — stub to prevent import errors in legacy components
const noop = () => Promise.resolve({});
const makeProxy = () => new Proxy({}, {
  get: (_, prop) => {
    if (prop === 'then') return undefined; // not a thenable
    return makeProxy();
  },
  apply: () => Promise.resolve({}),
});

export const base44 = {
  entities: makeProxy(),
  functions: { invoke: noop },
  integrations: { Core: { UploadFile: noop } },
  auth: { me: noop },
};
