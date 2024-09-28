import ExpressApp from "./framework/express/ExpressApp";

class Main {
    public static start() {
      const expressApp = new ExpressApp();
      const port: number = parseInt(process.env.PORT as string, 10) || 8001;
      expressApp.run(port);
    }
}
Main.start();
