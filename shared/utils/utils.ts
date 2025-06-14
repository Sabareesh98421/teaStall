
function urlBuilder(baseUrl: string, targetPath: string): URL {
    const url = new URL(targetPath, baseUrl);
    return url;
}

interface IConfig {
    errMessage?: string;
    isAsync: boolean
}
type AsyncOrSyncFunc<T, Args extends unknown[]> = (...args: Args) => T | Promise<T>;

class TryCatchSynthesizer<T, Args extends unknown[]> {
    private func: AsyncOrSyncFunc<T, Args>; // Function that can be synchronous or asynchronous
    private catchHandlers: ((err: any) => void)[] = [];
    // default error message and params,
    private config: IConfig;
    constructor(func: AsyncOrSyncFunc<T, Args>, config?: IConfig) {
        this.func = func;
        this.config = {
            errMessage: "An error occurred",
            isAsync: false,
            ...config

        }

    }

    run(...args: Args): T | Promise<T | undefined> {
        try {
            const isReallyAsync = this.func.constructor.name === 'AsyncFunction';


            if (this.config.isAsync && !isReallyAsync) {
                throw new Error("Function is not actually async, but 'isAsync' is set to true.");
            }
            // remove one redundant check here  or is it really needed?
            if (this.config.isAsync && isReallyAsync) {
                return this.asyncFunctionTrigger(args);;
            }

            const result = this.func(...args);
            return result;
        } catch (err) {
            this.handleError(err);
            return undefined as T;
        }
    }
    catch(handler: (err: any) => void): this {
        this.catchHandlers.push(handler);
        return this;
    }

    private handleError(err: any) {
        console.error(this.config.errMessage || 'Error occurred:', err);
        for (const handler of this.catchHandlers) {
            try {
                handler(err);
            } catch (e) {
                console.warn('Catch handler threw:', e);
            }
        }
    }
    private async asyncFunctionTrigger(
        params: Args,
    ): Promise<T | undefined> {
        try {
            return await this.func(...params);
        } catch (err) {
            this.handleError(err);
            return undefined;
        }
    }
}

export function tryCatchSynthesizer<T, Args extends unknown[] = []>(func: AsyncOrSyncFunc<T, Args>,config?: IConfig
): TryCatchSynthesizer<T, Args> {
    return new TryCatchSynthesizer(func, config);
  }