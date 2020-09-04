import { debounce } from "ts-debounce";

export default function Debounce(wait: number, immediate = false) {
  return function(
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    descriptor.value = debounce(descriptor.value, wait, {
      isImmediate: immediate
    });

    return descriptor;
  };
}