import express from 'express';
import bodyParser from 'body-parser';
import LogentriesSlack from './handlers/LogentriesSlack';

class App {
  instance: express.Application;

  constructor() {
    this.instance = express();
    this.mountRoutes();
  }

  start(port: number): void {
    this.instance.listen(port, (err: Error) => {
      if (err) return console.log(err);
      return console.log(`Server is listening at ${port}`);
    });
  }

  private mountRoutes(): void {
    const router = express.Router();
    router.use(bodyParser.urlencoded({
      extended: true,
      type: 'application/x-www-form-urlencoded'
    }));

    router.post('/logentries-webhook', LogentriesSlack.handler);
    this.instance.use('/', router);
  }
}

const app = new App();
app.start(3000);
