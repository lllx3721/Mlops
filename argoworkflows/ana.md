aws ec2 describe-instances --query 'Reservations[*].Instances[*].InstanceId' --output text
aws ec2 describe-instances --filters "Name=instance-state-name,Values=terminated" --query 'Reservations[*].Instances[*].InstanceId' --output text
