export class Scanner {
  constructor(private readonly _input: string) {}
  private _index = 0;

  readRe(re: RegExp): RegExpExecArray | undefined {
    if (!(re.sticky || re.global)) {
      throw new Error("Requires sticky or global flag.");
    }

    re.lastIndex = this._index;
    const result = re.exec(this._input);
    if (result == null) return;
    this._index = re.lastIndex;

    return result;
  }

  readReMany(re: RegExp): RegExpExecArray[] {
    if (!(re.sticky || re.global)) {
      throw new Error("Requires sticky or global flag.");
    }

    const xs: RegExpExecArray[] = [];

    re.lastIndex = this._index;
    while (true) {
      const result = re.exec(this._input);
      if (result == null) break;
      xs.push(result);
    }
    this._index = re.lastIndex || this._input.length;

    return xs;
  }

  end(): boolean {
    return this._index === this._input.length;
  }
}
