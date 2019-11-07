'use strict';

const {Configuration, Eyes, Target, StitchMode} = require('@applitools/eyes.webdriverio');


const DEFAULT_VIEWPORT = {
  width: 800,
  height: 600
};


class EyesService {

  /**
   *
   * @param {Configuration} [config]
   */
  constructor(config) {
    this.eyes = new Eyes();
  }


  beforeSession(config, caps) {
    const eyesConfig = config.eyes;
    if (eyesConfig) {
      this.eyes.setConfiguration(eyesConfig);

      if (!process.env.APPLITOOLS_API_KEY) {
        process.env.APPLITOOLS_API_KEY = eyesConfig.apiKey;
      }
    }
    this.eyes.setHideScrollbars(true);
  }


  before(caps) {
    browser.addCommand('eyesCheck', (title, checkSettings = Target.window().fully()) => {
      return this.eyes.check(title, checkSettings);
    });

    browser.addCommand('eyesCheckWindow', (title, checkSettings) => {
      return this.eyes.check(title, checkSettings);
    });

    browser.addCommand('eyesGetConfiguration', () => {
      return this.eyes.getConfiguration();
    });

  }


  async beforeTest(test) {
    const appName = this.eyes.getConfiguration().getAppName() || test.parent;
    const testName = test.title;

    let viewport = DEFAULT_VIEWPORT;
    if (this.eyes.getConfiguration().getViewportSize()) {
      viewport = this.eyes.getConfiguration().getViewportSize();
    }

    await global.browser.call(() => this.eyes.open(global.browser, appName, testName, viewport));
  }


  async afterTest(exitCode, config, capabilities) {
    try {
      const result = await browser.call(() => this.eyes.close(false));
    } catch (e) {
      await browser.call(() => this.eyes.abortIfNotClosed());
    }
  }


  after() {
    // browser.call(() => this.eyes.abortIfNotClosed());
  }
}

module.exports = EyesService;
