import { Tag } from 'antd';
import TagWrapper from '../../containers/UIElements/Tag/Tag.styles';

const Tags = (props) => (
  <TagWrapper>
    <Tag {...props}>{props.children}</Tag>
  </TagWrapper>
);

export default Tags;
