from rest_framework import serializers

from .models import School, Subject, Core, Course, Comment, Section, SectionClass


class SectionClass(serializers.ModelSerializer):
    class Meta:
        model = SectionClass
        fields = "__all__"


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = "__all__"


class SectionSerializer(serializers.ModelSerializer):
    section_type = serializers.CharField()
    comments = CommentSerializer(many=True)
    section_classes = SectionClass(source="sectionclass_set", many=True)

    class Meta:
        model = Section
        fields = "__all__"


class SchoolSerializer(serializers.ModelSerializer):
    class Meta:
        model = School
        fields = "__all__"


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = "__all__"


class CoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Core
        fields = "__all__"


class CourseSerializer(serializers.ModelSerializer):
    school = SchoolSerializer()
    subject = SubjectSerializer()
    cores = CoreSerializer(many=True)
    sections = SectionSerializer(source="section_set", many=True)

    class Meta:
        model = Course
        fields = "__all__"
