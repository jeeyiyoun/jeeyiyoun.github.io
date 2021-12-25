declare const prefix = "__framer__";
export declare type Prefixed<Type extends {}> = {
    [Property in keyof Type as `${typeof prefix}${string & Property}`]: Type[Property];
};
export declare function extractPrefixedProps<Props, Rest>(props: Prefixed<Props> & Rest): [Props, Rest];
export {};
//# sourceMappingURL=hocOptions.d.ts.map