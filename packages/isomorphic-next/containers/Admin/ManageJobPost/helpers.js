import axios from 'axios';

const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;

export const getServerSideData = async ({ req, res, query }) => {
  const response = await axios.get(`${baseUrl}/job_posting/job_posting_list/`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'TOKEN 1b1e0fa5309235ab56d03038eac42bae75c9755878b52694880b332234881c7a',
    },
  });

  return { props: { response: response.data } };
};
