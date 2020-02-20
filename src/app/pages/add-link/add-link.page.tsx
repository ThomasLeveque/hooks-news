import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Formik, FormikHelpers, Form, Field, ErrorMessage, FormikProps } from 'formik';
import { Row, Col, AutoComplete, Icon, PageHeader } from 'antd';

import { CurrentUserContext } from '../../providers/current-user/current-user.provider';
import { CategoriesContext } from '../../providers/categories/categories.provider';
import { firestore } from '../../firebase/firebase.service';
import { FormInput } from '../../components/form-input/form-input.component';
import CustomButton from '../../components/custom-button/custom-button.component';

import { ILink } from '../../interfaces/link.interface';
import { ICreateLinkInitialState } from '../../interfaces/initial-states.type';
import { linkSchema } from '../../schemas/link.schema';
import { isError, isValid as isValidCategory } from '../../utils';
import { ICategory } from '../../interfaces/category.interface';

import './add-link.styles.less';

const INITIAL_STATE: ICreateLinkInitialState = {
  description: '',
  url: '',
  category: ''
};

const AddLinkPage: React.FC<RouteComponentProps<{}>> = ({ history }) => {
  const { currentUser } = React.useContext(CurrentUserContext);
  const { categories } = React.useContext(CategoriesContext);

  const [addCatLoading, setAddCatLoading] = React.useState<boolean>(false);
  const [createLinkLoading, setCreateLinkLoading] = React.useState<boolean>(false);

  const isCategorieExist = (value: any) => {
    return !!categories.find(categorie => categorie.name === value);
  };

  const handleAddCategory = async (category: string): Promise<void> => {
    if (!currentUser) {
      history.push('/signin');
    } else {
      setAddCatLoading(true);
      await firestore.collection('categories').add({ name: category });
      setAddCatLoading(false);
    }
  };

  const handleCreateLink = async ({ url, description, category }: ICreateLinkInitialState): Promise<void> => {
    if (!currentUser) {
      history.push('/signin');
    } else {
      const { id, displayName } = currentUser;
      const newLink: ILink = {
        url,
        description,
        category,
        postedBy: {
          id,
          displayName
        },
        voteCount: 0,
        votes: [],
        comments: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      setCreateLinkLoading(true);
      await firestore.collection('links').add(newLink);
      history.push('/');
    }
  };

  return (
    <div className="add-link-page">
      <PageHeader onBack={history.goBack} title={<h1 className="H2">Create a new link</h1>} />
      <Formik
        enableReinitialize
        initialValues={INITIAL_STATE}
        validationSchema={linkSchema}
        onSubmit={async (values: ICreateLinkInitialState, { setSubmitting }: FormikHelpers<ICreateLinkInitialState>) => {
          await handleCreateLink(values);
          setSubmitting(false);
        }}
      >
        {({ isSubmitting, isValid, errors, touched, values, setFieldValue, setFieldTouched }: FormikProps<ICreateLinkInitialState>) => {
          const { Option } = AutoComplete;
          const autoCompleteChildren = categories
            .map((category: ICategory) => (
              <Option key={category.id} value={category.name}>
                {category.name}
              </Option>
            ))
            .concat(
              !isCategorieExist(values.category) && values.category.length !== 0
                ? [
                    <Option value="" key="add" disabled className="add-category">
                      <div onClick={() => handleAddCategory(values.category)}>
                        Add <span>{values.category}</span> to categories <Icon type={addCatLoading ? 'loading' : 'plus'} />
                      </div>
                    </Option>
                  ]
                : []
            );

          return (
            <Form className="add-link-form">
              <Row type="flex" gutter={[16, 16]} justify="end">
                <Col span={24}>
                  <Field
                    autoComplete="off"
                    name="description"
                    placeholder="A description for your link"
                    type="text"
                    hasLabel
                    label="Description"
                    component={FormInput}
                  />
                </Col>
                <Col span={12}>
                  <Field
                    autoComplete="off"
                    name="url"
                    placeholder="The URL of the link"
                    type="text"
                    hasLabel
                    label="URL"
                    component={FormInput}
                  />
                </Col>
                <Col span={12}>
                  <div
                    className={`${
                      isError(errors, touched, 'category') || (!isCategorieExist(values.category) && values.category.length !== 0)
                        ? 'custom-autocomplete-error'
                        : ''
                    } custom-autocomplete`}
                  >
                    <label htmlFor="category">Category</label>
                    <div className="custom-autocomplete-container">
                      <AutoComplete
                        placeholder="A category for yout link"
                        onChange={(value: any) => {
                          setFieldValue('category', value);
                        }}
                        filterOption={(inputValue: any, option: any) =>
                          option.props.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1 || option.props.value.length === 0
                        }
                        onBlur={() => setFieldTouched('category', true)}
                        value={values.category}
                      >
                        {autoCompleteChildren.reverse()}
                      </AutoComplete>
                      {(isError(errors, touched, 'category') || !isCategorieExist(values.category)) && values.category.length !== 0 && (
                        <Icon
                          type="close-circle"
                          theme="filled"
                          className="custom-autocomplete-icon custom-autocomplete-icon-gray pointer"
                          onClick={() => setFieldValue('category', '', true)}
                        />
                      )}
                      {isValidCategory(errors, touched, 'category') && isCategorieExist(values.category) && (
                        <Icon type="smile" className="custom-autocomplete-icon custom-autocomplete-icon-green" />
                      )}
                    </div>
                    {isError(errors, touched, 'category') && <span className="custom-autocomplete-error-text">{errors['category']}</span>}
                    {!isCategorieExist(values.category) && values.category.length !== 0 && (
                      <span className="custom-autocomplete-error-text">You should add this category</span>
                    )}
                  </div>
                </Col>
              </Row>
              <div className="add-link-buttons">
                <CustomButton
                  text={createLinkLoading ? 'Loading...' : 'Submit'}
                  type="submit"
                  buttonType="primary"
                  hasIcon
                  iconType="plus"
                  loading={isSubmitting || createLinkLoading}
                  disabled={createLinkLoading || isSubmitting || !isValid}
                />
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default withRouter(AddLinkPage);
