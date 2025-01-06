export const validateRichText = (ref, that) => {

  return (rule, _value, callback) => {
    
    const value = that.$refs[ref].getValue();

    if (value) {
      callback();
    } else {
      callback(new Error('请输入'));
    }
  };
};