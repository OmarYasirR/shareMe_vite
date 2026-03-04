import {
  route,
} from "@react-router/dev/routes";

export default [
  index("./routes/_index.jsx"),
  route("signup", "../components/SignUp.jsx"),
  route("some/path", "./some/file.tsx"),
  // pattern ^           ^ module file
] 
