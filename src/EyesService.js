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
    this._eyes = new Eyes();

    this._appName = null;
  }


  beforeSession(config, caps) {
    const eyesConfig = config.eyes;
    if (eyesConfig) {
      this._eyes.setConfiguration(eyesConfig);
      this._appName = this._eyes.getConfiguration().getAppName();

      if (!process.env.APPLITOOLS_API_KEY) {
        process.env.APPLITOOLS_API_KEY = eyesConfig.apiKey;
      }
    }
    this._eyes.setHideScrollbars(true);
  }


  before(caps) {
    browser.addCommand('eyesCheck', (title, checkSettings = Target.window().fully()) => {
      return this._eyes.check(title, checkSettings);
    });

    browser.addCommand('eyesCheckWindow', (title, checkSettings) => {
      return this._eyes.check(title, checkSettings);
    });

    browser.addCommand('eyesGetConfiguration', () => {
      return this._eyes.getConfiguration();
    });

  }


  async beforeTest(test) {
    if (!this._appName) {
      this._eyes.getConfiguration().setAppName(test.parent);
    }

    this._eyes.getConfiguration().setTestName(test.title);

    if (!this._eyes.getConfiguration().getViewportSize()) {
      this._eyes.getConfiguration().setViewportSize(DEFAULT_VIEWPORT);
    }

    await global.browser.call(() => this._eyes.open(global.browser));
  }


  async afterTest(exitCode, config, capabilities) {
    try {
      const result = await browser.call(() => this._eyes.close(false));
    } catch (e) {
      await browser.call(() => this._eyes.abortIfNotClosed());
    }
  }


  after() {
    // browser.call(() => this.eyes.abortIfNotClosed());
  }
}

module.exports = EyesService;
