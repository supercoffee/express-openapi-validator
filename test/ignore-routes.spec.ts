import { createApp } from './common/app';
import * as path from "path";
import { expect } from 'chai';
import * as request from 'supertest';

const packageJson = require('../package.json');
const apiSpecPath = path.join('test', 'resources', 'openapi.yaml');

describe(packageJson.name, () => {
  let app = null;
  before(async () => {
    app = await createApp({
      apiSpec: apiSpecPath
    }, 3000, (app) => {
      app.get('undocumented_route', (req, res, next) => {
        res.json({success: true});
      });
    });
  });

  after(() => {
    app.server.close();
  });

  describe(`Undocumented route should skip validation`, () => {
    it('should allow undocumented route', async () => {
      await request(app)
        .get(`${app.basePath}/undocumented_route`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .then(r => {
          expect(r.body.success).to.equal(true)
        })
    });
  });
});
