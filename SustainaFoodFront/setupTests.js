import { TextEncoder, TextDecoder } from 'util';
import '@testing-library/jest-dom';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Si nécessaire, mock de Response (au cas où tu en as besoin ailleurs)
global.Response = global.Response || class {
  constructor(body, init) {
    this.body = body;
    Object.assign(this, init);
  }
  json() {
    return Promise.resolve(this.body);
  }
};

// Mock localStorage
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
