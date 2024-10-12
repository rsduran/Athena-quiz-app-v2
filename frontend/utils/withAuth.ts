// utils/withAuth.ts

import { GetServerSideProps, GetServerSidePropsContext } from 'next';

export function withAuth(gssp: GetServerSideProps) {
  return async (context: GetServerSidePropsContext) => {
    const { req, res } = context;
    const token = req.cookies.token;

    if (!token) {
      return {
        redirect: {
          destination: '/signin',
          permanent: false,
        },
      };
    }

    // TODO: Validate token here

    return await gssp(context);
  };
}