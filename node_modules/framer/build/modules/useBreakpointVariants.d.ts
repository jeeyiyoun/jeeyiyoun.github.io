/** @internal */
interface Breakpoint {
    min?: number;
    max?: number;
}
/** @internal */
export declare function useBreakpointVariants(initial: string, width: number | undefined, breakpoints: Record<string, Breakpoint>): string | undefined;
export {};
//# sourceMappingURL=useBreakpointVariants.d.ts.map