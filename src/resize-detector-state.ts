export interface ResizeDetectorElementSize {
  width: number;
  height: number;
}

export interface ResizeDetectorElementState {
  width: number;
  oldWidth: number;
  widthChanged: boolean;

  height: number;
  oldHeight: number;
  heightChanged: boolean;
}

export class ResizeSize implements ResizeDetectorElementSize {
  public readonly width: number;
  public readonly height: number;

  constructor(width: number, height: number) {
    this.width = width | 0;
    this.height = height | 0;

    if (this.width < 0) {
      this.width = 0;
    }

    if (this.height < 0) {
      this.height = 0;
    }
  }

  public equals(other: ResizeSize): boolean {
    return this.width === other.width && this.height === other.height;
  }

  public createResizeSize(previous: ResizeSize): ResizeDetectorElementState {
    const widthChange = previous.width !== this.width;
    const heightChanged = previous.height !== this.height;

    return {
      width: this.width,
      oldWidth: previous.width,
      widthChanged: widthChange,
      height: this.height,
      oldHeight: previous.height,
      heightChanged: heightChanged
    };
  }
}
