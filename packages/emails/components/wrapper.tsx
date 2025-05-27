import { Html, Tailwind } from "@react-email/components";

interface TwWrapperProps {
  children: React.ReactNode;
}

export const EmailWrapper = ({ children }: TwWrapperProps) => {
  return (
    <Html>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                brand: "#007291",
              },
            },
          },
        }}
      >
        {children}
      </Tailwind>
    </Html>
  );
};
