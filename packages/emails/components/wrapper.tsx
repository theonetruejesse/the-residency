import { Html, Tailwind, Head } from "@react-email/components";

export interface NameProps {
  name?: string;
}

interface ChildrenWrapperProps {
  children: React.ReactNode;
}

export const EmailWrapper = ({
  name,
  children,
}: ChildrenWrapperProps & NameProps) => {
  return (
    <Html>
      <Head>
        {/* Manrope font from Google Fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <style>
          {`
            body, .manrope-font {
              font-family: 'Manrope', Arial, sans-serif !important;
            }
          `}
        </style>
      </Head>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                brand: "#F2F0EF",
              },
              fontFamily: {
                manrope: ["Manrope", "Arial", "sans-serif"],
              },
            },
          },
        }}
      >
        <div className="lowercase font-manrope manrope-font p-2">
          <EmailHeader name={name} />
          {children}
          <EmailFooter />
        </div>
      </Tailwind>
    </Html>
  );
};

const EmailHeader = ({ name }: NameProps) => {
  return <h1>hi{name ? `, ${name}` : ""}!</h1>;
};

const EmailFooter = () => {
  return (
    <div className="mt-3">
      <p>-</p>
      <p>🫶 the residency team</p>
      <span>
        🐥 <a href="https://x.com/_TheResidency">@_TheResidency</a>{" "}
      </span>
      <span>
        🔗 <a href="https://livetheresidency.com">livetheresidency.com</a>
      </span>
    </div>
  );
};
