import 'vue';


declare module 'vue' {
    interface ComponentCustomProperties {
        $t: (text_id: string, option?: object) => string;
    }
}

export { };
