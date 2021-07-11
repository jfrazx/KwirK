import { Slack, ISlack, ISlackOptions } from '../../../networks/slack';
import { NetworkHandlerRule } from '../base';

export class SlackRule extends NetworkHandlerRule<ISlack, ISlackOptions> {
  static type = 'slack';

  shouldHandle(): boolean {
    return this.options.type === SlackRule.type;
  }

  handle(): Slack {
    return new Slack(this.bot, this.options);
  }
}
