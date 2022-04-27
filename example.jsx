const Foo = () => {
  return <div>{greeting}</div>;
};

const greeting = "Hello, World!";

export const Bar = Foo;

export const Baz = () => 123;
