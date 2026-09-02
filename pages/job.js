import React from 'react';
import JobIndex from '../src/components/home/job/index';
import { useSelector } from "react-redux";


const JobPage = (props) => {
      const { configData } = useSelector((state) => state.configData);

  return <JobIndex {...props} configData={configData} />;

};

export default JobPage;
