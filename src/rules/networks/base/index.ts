import { OptionsContainer, OptionsMerger, OptionsValidator } from '@kwirk/options';
import { INetworkOptions, INetwork } from '@kwirk/networks';
import { ShouldHandle } from '../../../interfaces';
import { Abstract } from '@status/abstract';
import { IBot } from '@kwirk/bot';

@Abstract
export abstract class NetworkHandlerRule<T extends INetwork, O extends INetworkOptions>
  implements ShouldHandle<T>
{
  static type: string;

  protected defaultOptions: O = {} as O;
  protected optionsValidator: OptionsValidator<O> = (options) => options;
  protected optionsMerger: OptionsMerger<O, O> = (initial) => ({
    ...this.defaultOptions,
    ...initial,
  });

  constructor(protected bot: IBot, protected initializationOptions: O) {}

  abstract shouldHandle(): boolean;
  abstract handle(): T;

  protected get options() {
    return OptionsContainer.create(this.initializationOptions, {
      optionsMerger: this.optionsMerger,
      optionsValidator: this.optionsValidator,
    });
  }
}
