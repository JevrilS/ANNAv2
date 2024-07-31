from rest_framework import serializers
from .models import User, School

class SchoolSerializer(serializers.ModelSerializer):
    class Meta:
        model = School
        fields = ['id', 'school_des', 'school_add']

class UserSerializer(serializers.ModelSerializer):
    school_id = serializers.PrimaryKeyRelatedField(
        queryset=School.objects.all(),
        source='school',  # This maps `school_id` to the `school` field in the `User` model
    )

    class Meta:
        model = User
        fields = ['id_no', 'full_name', 'email', 'mobile_no', 'school_id', 'strand', 'sex', 'grade_level']

    def update(self, instance, validated_data):
        school = validated_data.pop('school', None)
        if school is not None:
            instance.school = school

        instance.id_no = validated_data.get('id_no', instance.id_no)
        instance.full_name = validated_data.get('full_name', instance.full_name)
        instance.email = validated_data.get('email', instance.email)
        instance.mobile_no = validated_data.get('mobile_no', instance.mobile_no)
        instance.strand = validated_data.get('strand', instance.strand)
        instance.sex = validated_data.get('sex', instance.sex)
        instance.grade_level = validated_data.get('grade_level', instance.grade_level)
        instance.save()
        return instance

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    confirm_password = serializers.CharField(write_only=True, required=True)
    school = serializers.PrimaryKeyRelatedField(queryset=School.objects.all())

    class Meta:
        model = User
        fields = ['id_no', 'full_name', 'email', 'password', 'confirm_password', 'school', 'mobile_no', 'sex', 'strand', 'grade_level']

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords must match."})
        return data

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        return user
class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    confirm_new_password = serializers.CharField(required=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_new_password']:
            raise serializers.ValidationError({"message": "New passwords do not match"})
        return data