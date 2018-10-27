import React from 'react';
import { Select } from 'antd';

const { Option } = Select; // eslint-disable-line no-shadow

export default function Selector({ value, onChange, options }) {
  return (
    <Select value={value} onChange={onChange} className="option-selector" >
      {options.map((option) => <Option key={option}>{option}</Option>)}
    </Select>
  );
}
