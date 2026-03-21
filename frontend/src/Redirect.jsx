import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Redirect = ({url}) => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(url);
  }, []);
  return <></>;
};

export default Redirect;
