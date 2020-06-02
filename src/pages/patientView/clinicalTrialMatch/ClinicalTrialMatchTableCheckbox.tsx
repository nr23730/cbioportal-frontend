import PropTypes from 'prop-types';
import React from 'react';

const Checkbox = ({ type = 'checkbox', checked = true, ...props }) => (
    <input type={type} checked={checked} {...props} />
);

Checkbox.propTypes = {
    type: PropTypes.string,
    name: PropTypes.string.isRequired,
    checked: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
};

export default Checkbox;
