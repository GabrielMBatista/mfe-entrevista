import dynamic from "next/dynamic";
import { NextPage, NextPageContext } from "next";

const ErrorClient = dynamic(() => import("@/components/ErrorClient"), {
  ssr: false,
});

interface ErrorPageProps {
  statusCode?: number;
  message?: string;
}

const ErrorPage: NextPage<ErrorPageProps> = ({ statusCode, message }) => {
  return <ErrorClient statusCode={statusCode} message={message} />;
};

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res?.statusCode || err?.statusCode || 500;
  const message = err?.message || "An unexpected error occurred.";
  return { statusCode, message };
};

export default ErrorPage;
