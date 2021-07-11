const defaultOptionsMerger: OptionsMerger<any, any> = (initialOptions) => initialOptions;
const defaultOptionsValidator: OptionsValidator<any> = (options) => options;

export class OptionsContainer<InitialOptions extends object, MergedOptions> {
  private readonly optionsMerger: OptionsMerger<InitialOptions, MergedOptions>;
  private readonly optionsValidator: OptionsValidator<MergedOptions>;

  constructor(
    protected initialOptions: InitialOptions,
    optionsOptions: OptionsOptions<InitialOptions, MergedOptions>,
  ) {
    this.optionsMerger = optionsOptions.optionsMerger;
    this.optionsValidator = optionsOptions.optionsValidator;

    const options = this.optionsMerger(initialOptions);

    this.optionsValidator(options);

    Object.entries(options).forEach(([key, value]) => {
      Object.defineProperty(this, key, {
        enumerable: true,
        value,
      });
    });
  }

  replace(updatedOptions: Partial<MergedOptions>): Options<InitialOptions, MergedOptions> {
    return OptionsContainer.create(
      { ...this.initialOptions, ...updatedOptions },
      {
        optionsMerger: this.optionsMerger,
        optionsValidator: this.optionsValidator,
      },
    );
  }

  static create<InitialOptions extends object, MergedOptions = InitialOptions>(
    options: InitialOptions,
    {
      optionsMerger = defaultOptionsMerger,
      optionsValidator = defaultOptionsValidator,
    }: OptionsOptions<InitialOptions, MergedOptions> = {},
  ) {
    return new OptionsContainer(options, { optionsMerger, optionsValidator }) as Options<
      InitialOptions,
      MergedOptions
    >;
  }
}

export type Options<InitialOptions extends object, MergedOptions = InitialOptions> = OptionsContainer<
  InitialOptions,
  MergedOptions
> &
  MergedOptions;
export type OptionsMerger<InitialOptions, MergedOptions> = (
  initialOptions: InitialOptions,
) => MergedOptions;

export type OptionsValidator<Options> = (options: Options) => void;

export interface OptionsOptions<InitialOptions extends object, MergedOptions = InitialOptions> {
  optionsMerger?: OptionsMerger<InitialOptions, MergedOptions>;
  optionsValidator?: OptionsValidator<MergedOptions>;
}
