import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Formik, Form, Field, FormikHelpers, FormikProps } from 'formik';

import { FormInput } from '../../components/form-input/form-input.component';
import Button from '../../components/custom-button/custom-button.component';
import UnderlineLink from '../../components/underline-link/underline-link.component';

import { register, createUserProfileDocument } from '../../firebase/firebase.service';
import { IRegisterInitialState } from '../../interfaces/initial-states.type';
import { registerSchema } from '../../schemas/user.schema';

import './sign-up.styles.less';

const INITIAL_REGISTER_STATE: IRegisterInitialState = {
  displayName: '',
  email: '',
  password: ''
};

const SignUp: React.FC<RouteComponentProps<{}>> = ({ history }) => {
  const [firebaseError, setFirebaseError] = React.useState<string | null>(null);

  const authenticateUser = async (values: IRegisterInitialState): Promise<void> => {
    const { displayName, email, password }: IRegisterInitialState = values;
    try {
      const { user } = await register(email, password);
      await createUserProfileDocument(user, { displayName });
      history.push('/');
    } catch (err) {
      setFirebaseError(err.message || err.toString());
    }
  };

  return (
    <Formik
      initialValues={INITIAL_REGISTER_STATE}
      validationSchema={registerSchema}
      onSubmit={async (values: IRegisterInitialState, { setSubmitting }: FormikHelpers<IRegisterInitialState>) => {
        await authenticateUser(values);
        setSubmitting(false);
      }}
      enableReinitialize
    >
      {({ isSubmitting, isValid }: FormikProps<IRegisterInitialState>) => (
        <Form autoComplete="on" className="sign-up flex column align-items-center">
          <Field
            autoComplete="username"
            name="displayName"
            placeholder="Your name"
            type="text"
            hasLabel
            label="Name"
            component={FormInput}
          />
          <Field name="email" autoComplete="email" placeholder="Your email" type="text" hasLabel label="Email" component={FormInput} />
          <Field
            name="password"
            placeholder="Choose a secure password"
            autoComplete="current-password"
            type="password"
            hasLabel
            label="Password (at least 6 characters)"
            component={FormInput}
          />
          {firebaseError && <p className="error-text text-align-center">{firebaseError}</p>}
          <Button text="Sign up" buttonType="primary" type="submit" disabled={isSubmitting || !isValid} loading={isSubmitting} />
          <UnderlineLink type="insider" to="/forgot">
            Forgot password ?
          </UnderlineLink>
        </Form>
      )}
    </Formik>
  );
};

export default withRouter(SignUp);
