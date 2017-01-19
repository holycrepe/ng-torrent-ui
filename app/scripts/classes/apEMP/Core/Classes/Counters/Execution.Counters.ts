namespace apEMP.Classes.Counters {
    export class Range {
        public length: number;
        constructor(public start: number, obj: number|any[]) {
            this.length = Range.getLength(obj);
        }

        get end(): number {
            return this.start + this.length;
        }
        public static getLength(obj: number | any[]) {
            if (typeof obj === "number") {
                return <number> obj;
            } else {
                return obj.length;
            }
        }
    }

    export class LoopCounter {
        private _index:number=0;
        readonly length:number;
        constructor(obj: number|any[]) {
            this.length = Range.getLength(obj);
            this._index = 0;
        }
        static create(length: number):LoopCounter;
        static create(array: any[]):LoopCounter;
        static create(obj: number|any[]):LoopCounter {
            return new LoopCounter(obj);
        }
        get index(): number {
            return this._index;
        }
        get current(): number {
            return this._index + 1;
        }
        get active(): boolean {
            return this._index < this.length;
        }

        step() {
            this._index++;
        }
    }
}
